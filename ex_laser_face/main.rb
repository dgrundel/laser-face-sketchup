require 'sketchup.rb'

module Grundel
  module LaserFace

    def self.get_selected_face_data
      Sketchup.active_model.selection.grep(Sketchup::Face).map { |f|
        {
            normal: f.normal.to_a,
            outer_loop: f.outer_loop.vertices.map { |v|
              v.position.to_a
            },
            other_loops: f.loops.select { |l| true unless l.outer? }.map { |l| l.vertices.map { |v| v.position.to_a } }
        }
      }
    end

    unless file_loaded?(__FILE__)

      UI.add_context_menu_handler do |context_menu|
        # Sketchup.active_model.options["UnitsOptions"]["LengthPrecision"]

        # Length::to_f is always in inches.
        # Length::to_s includes the unit set for the file
        # Sketchup.active_model.selection.grep(Sketchup::Face).first.edges.first.length.to_f

        s_m = context_menu.add_submenu('LaserFace')

        # s_m.add_item('How many faces?') {
        #   # puts "#{edge.length} (#{edge.length.inspect})"
        #   # faces.each do |face|
        #     # face.
        #   # end
        #   faces = Sketchup.active_model.selection.grep(Sketchup::Face)
        #   message = if faces.empty?
        #     'No faces! :('
        #   else
        #     "#{faces.count} faces selected."
        #   end
        #
        #   UI.messagebox(message, MB_OK)
        # }

        s_m.add_item('Export faces') {
          faces = Sketchup.active_model.selection.grep(Sketchup::Face)
          if faces.empty?
            UI.messagebox('No faces selected.', MB_OK);
          else
            # f.mesh.points.each{|p| puts(p.project_to_plane([0.0,0.0,0.0], [0.0,1.0,0.0], [1.0,1.0,0.0])) }
            # (9.58746mm, 685.458245mm, 0mm)
            # (-78.104191mm, 685.458245mm, 0mm)
            # (78.867404mm, 685.458245mm, 0mm)
            #
            #
            #
            json = {
                units: Sketchup.active_model.options['UnitsOptions']['LengthUnit'],
                faces: get_selected_face_data
            }.to_json

            dialog = UI::HtmlDialog.new({
              dialog_title: 'LaserFace',
              preferences_key: 'com.grundel.laserFace',
              scrollable: true,
              resizable: true,
              width: 1100,
              height: 800,
              left: 100,
              top: 100,
              min_width: 1000,
              min_height: 500,
              # max_width: 1000,
              # max_height: 1000,
              style: UI::HtmlDialog::STYLE_DIALOG
            })
            dialog.add_action_callback("getData") { |action_context, param1, param2|
              dialog.execute_script("LaserFace.setData(#{json})")
            }
            dialog.set_file(File.expand_path('../ui/dist/index.html', File.dirname(__FILE__)))
            dialog.show

            # dialog.execute_script("LaserFace.sendMessage(#{json})")

            # UI.messagebox(json, MB_OK)
          end
        }

        # s_m.add_item('What unit?') {
        #   length_unit = Sketchup.active_model.options['UnitsOptions']['LengthUnit']
        #   length_unit_str = %w(in ft mm cm m yd)[length_unit];
        #
        #   message = length_unit_str.nil? ? 'Dunno.' : "We're using #{length_unit_str}!"
        #
        #   UI.messagebox(message, MB_OK)
        # }

        # unless selset.grep(Sketchup::Face).empty?
        #   s_m.add_item(LAYOUT_SVG) {
        #     facesvg_2d_layout(selset)
        #   }
        # end

        # if corner_relief_available(selset)
        #   s_m.add_item(CORNER_RELIEF) {
        #     facesvg_corner_relief(selset)
        #   }
        # end

        # s_m.add_item(WRITE_SVG) { facesvg_write } unless profile().empty?
      end

      file_loaded(__FILE__)
    end

  end # module LaserFace
end # module Grundel
