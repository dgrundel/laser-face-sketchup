# Copyright 2016 Daniel Grundel
# Licensed under the MIT license

require 'sketchup.rb'
require 'extensions.rb'

module Grundel
  module LaserFace

    unless file_loaded?(__FILE__)
      ex = SketchupExtension.new('LaserFace', 'ex_laser_face/main')
      ex.description = 'This might export faces as SVG files for laser cutting. Maybe.'
      ex.version     = '1.0.0'
      ex.creator     = 'Daniel Grundel'
      Sketchup.register_extension(ex, true)
      file_loaded(__FILE__)
    end

  end # module LaserFace
end # module Grundel
