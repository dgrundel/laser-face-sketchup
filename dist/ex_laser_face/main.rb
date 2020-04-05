# frozen_string_literal: true
require 'sketchup.rb'

module Grundel
  module LaserFace

    USER_PREFS_FILE_PATH = File.absolute_path('.laser_face_prefs.json', Dir.home)
    DIALOG_HTML_PATH = File.expand_path('index.html', File.dirname(__FILE__))
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

    def self.str_blank?(s)
      s.nil? || s.to_s.strip.empty?
    end

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

    def self.face_data(selected_faces)
      selected_faces.map do |f|
        {
            normal: f.normal.to_a,
            outer_loop: loop_vertices(f.outer_loop),
            other_loops: outer_loop_vertices(f)
        }
      end
    end

    def self.send_error_to_dialog(dialog, message)
      dialog.execute_script("sketchupConnector.receiveMessage(#{message.to_json}, 'error')")
    end

    def self.send_success_to_dialog(dialog, message)
      dialog.execute_script("sketchupConnector.receiveMessage(#{message.to_json}, 'success')")
    end

    def self.send_api_response_to_dialog(dialog, id, ok, message)
      dialog.execute_script("sketchupConnector.receiveAPIResponse(#{id}, #{ok},  #{message.to_json})")
    end

    def self.write_file(contents, file_path, overwrite)
      if File.exist?(file_path) && File.directory?(file_path)
        raise "File #{file_path} is a directory."
      elsif File.exist?(file_path) && !overwrite
        raise "File #{file_path} already exists."
      elsif File.exist?(file_path) && !File.writable?(file_path)
        raise "File #{file_path} is not writable."
      else
        File.write(file_path, contents)
      end
    end

    def self.show_export_dialog
      dialog = UI::HtmlDialog.new(DIALOG_OPTIONS)

      dialog.add_action_callback('writeFile') do |_action_context, id, file_path, file_contents, overwrite|
        begin
          write_file(file_contents, file_path, overwrite)
          send_api_response_to_dialog(dialog, id, true, "#{file_path} written successfully.")
        rescue StandardError => e
          send_api_response_to_dialog(dialog, id, false, e.message)
        end
      end

      dialog.add_action_callback('getFaces') do |_action_context, id|
        begin
          selected_faces = Sketchup.active_model.selection.grep(Sketchup::Face)
          face_data = face_data(selected_faces)
          send_api_response_to_dialog(dialog, id, true, face_data)
        rescue StandardError => e
          send_api_response_to_dialog(dialog, id, false, e.message)
        end
      end

      dialog.add_action_callback('saveUserPrefs') do |_action_context, prefs_json|
        begin
          write_file(prefs_json, USER_PREFS_FILE_PATH, true)
        rescue StandardError => e
          send_error_to_dialog(dialog, e.message)
        end
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
          fileSeparators: [File::SEPARATOR, File::ALT_SEPARATOR],
          userPrefsJson: user_prefs_json,
          units: model_units,
          faces: face_data(selected_faces)
        }
        dialog.execute_script("sketchupConnector.receiveModelData(#{dialog_data_value.to_json})")
      end

      dialog.add_action_callback('getExportPath') do |_action_context, prev_path, prev_name|
        start_path = str_blank?(prev_path) ? Dir.home : prev_path
        start_name = str_blank?(prev_name) ? 'export.svg' : prev_name
        path_to_save_to = UI.savepanel('Export as SVG', start_path, start_name)
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
