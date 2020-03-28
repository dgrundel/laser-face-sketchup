require 'sketchup.rb'

module Grundel
  module LaserFace

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


    def self.dialog_data
      model_units = Sketchup.active_model.options['UnitsOptions']['LengthUnit']
      selected_faces = Sketchup.active_model.selection.grep(Sketchup::Face)

      {
        units: model_units,
        faces: selected_faces.map do |f|
          {
            normal: f.normal.to_a,
            outer_loop: loop_vertices(f.outer_loop),
            other_loops: outer_loop_vertices(f)
          }
        end
      }
    end

    def self.show_export_dialog
      dialog = UI::HtmlDialog.new(DIALOG_OPTIONS)

      dialog.add_action_callback("getData") do |_action_context, _param1, _param2|
        dialog.execute_script("LaserFace.setData(#{dialog_data.to_json})")
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
