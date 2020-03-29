# frozen_string_literal: true
require 'sketchup.rb'

module Grundel
  module LaserFace

    USER_PREFS_FILE_PATH = File.absolute_path('.laser_face_prefs.json', Dir.home)
    DIALOG_HTML_PATH = File.expand_path('../ui/dist/index.html', File.dirname(__FILE__))
    DIALOG_OPTIONS = {
      dialog_title: 'LaserFace',
      preferences_key: 'com.grundel.laserFace',
      scrollable: false,
      resizable: true,
      width: 1100,
      height: 800,
      # left: 100,
      # top: 100,
      min_width: 1000,
      min_height: 500,
      # max_width: 1000,
      # max_height: 1000,
      style: UI::HtmlDialog::STYLE_DIALOG
    }.freeze

    def self.loop_vertices(loop)
      loop.vertices.map do |v|
        v.position.to_a
      end
    end

    def self.outer_loop_vertices(f)
      f.loops.select do |l|
        true unless l.outer?
      end.map(&method(:loop_vertices))
    end

    def self.send_error_to_dialog(dialog, message)
      dialog.execute_script("sketchupConnector.receiveError(#{message.to_json})")
    end

    def self.write_file(dialog, contents, file_path, overwrite)
      if File.exist?(file_path) && File.directory?(file_path)
        send_error_to_dialog(dialog, "File #{file_path} is a directory.")
      elsif File.exist?(file_path) && !overwrite
        send_error_to_dialog(dialog, "File #{file_path} already exists.")
      elsif File.exist?(file_path) && !File.writable?(file_path)
        send_error_to_dialog(dialog, "File #{file_path} is not writable.")
      else
        File.write(file_path, contents)
      end
    rescue StandardError => e
      send_error_to_dialog(dialog, e.message)
    end

    def self.show_export_dialog
      dialog = UI::HtmlDialog.new(DIALOG_OPTIONS)

      dialog.add_action_callback('writeFile') do |_action_context, file_path, file_contents, overwrite|
        write_file(dialog, file_contents, file_path, overwrite)
      end

      dialog.add_action_callback('saveUserPrefs') do |_action_context, prefs_json|
        write_file(dialog, prefs_json, USER_PREFS_FILE_PATH, true)
      end

      dialog.add_action_callback('getData') do |_action_context|
        model_units = Sketchup.active_model.options['UnitsOptions']['LengthUnit']
        selected_faces = Sketchup.active_model.selection.grep(Sketchup::Face)
        user_prefs_json = '{}'
        begin
          if File.file?(USER_PREFS_FILE_PATH) && File.readable?(USER_PREFS_FILE_PATH)
            user_prefs_json = File.read(USER_PREFS_FILE_PATH)
          end
        rescue StandardError => e
          send_error_to_dialog(dialog, e.message)
          user_prefs_json = '{}'
        end

        dialog_data_value = {
          userPrefsJson: user_prefs_json,
          units: model_units,
          faces: selected_faces.map do |f|
            {
                normal: f.normal.to_a,
                outer_loop: loop_vertices(f.outer_loop),
                other_loops: outer_loop_vertices(f)
            }
          end
        }
        dialog.execute_script("sketchupConnector.receiveModelData(#{dialog_data_value.to_json})")
      end

      dialog.add_action_callback('getExportPath') do |_action_context|
        path_to_save_to = UI.savepanel('Export as SVG', Dir.home, 'export.svg')
        dialog.execute_script("sketchupConnector.receiveExportPath(#{path_to_save_to.to_json})")
      end

      dialog.set_file(DIALOG_HTML_PATH)
      dialog.show
    end

    unless file_loaded?(__FILE__)

      UI.add_context_menu_handler do |context_menu|
        context_menu.add_item('Export faces as SVG', &method(:show_export_dialog))
      end

      file_loaded(__FILE__)
    end

  end # module LaserFace
end # module Grundel
