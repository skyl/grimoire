full_c = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]

trans = {
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 10,
  "Bb": 10,
  "B": 11,
}

chord_notes = {
  "maj": [0, 4, 7],
  "maj7": [0, 4, 7, 11],
  "min": [0, 3, 7],
}

get_full_chord = (note, chord) ->
  tn = trans[note]
  cns = chord_notes[chord]
  tcns = ((n + tn) % 12 for n in cns)
  full_chords = ((n + tcn for tcn in tcns) for n in full_c)
  a = new Array
  concatenated = full_chords.concat.apply(a, full_chords)
  return concatenated


class FretboardCanvas

  constructor: (@fretboard) ->
    @canvas = document.createElement "canvas"
    window.canvas = @canvas
    @canvas.width = @width = document.body.clientWidth
    @canvas.height = @height = document.body.clientHeight
    @ctx = @canvas.getContext "2d"

    # largest fret and border calculated from that
    @fretwidth = @width / 8
    @border = @fretwidth / 2
    @maxx = @width - @border
    @maxy = @height - @border
    @num_strings = @fretboard.length

    @xs = []
    @ratio = 1 / Math.pow(2, 1/12)
    fretwidth = @fretwidth
    wherex = @maxx
    while wherex > 0
      @xs.push wherex
      wherex = wherex - fretwidth
      fretwidth = fretwidth * @ratio

  draw_fretboard: () ->
    @ctx.beginPath()
    @ctx.strokeStyle = "red"

    for x in @xs
      @ctx.moveTo x, @border
      @ctx.lineTo x, @height - @border

    @ctx.stroke()

  draw_strings: () ->
    @ctx.beginPath()
    @ctx.strokeStyle = "black"
    @apart = (@height - @border * 2) / @num_strings
    @gutter = @border + @apart / 2
    wherey = @gutter
    while wherey < @height
      @ctx.moveTo 0, wherey
      @ctx.lineTo @maxx, wherey
      wherey += @apart
    @ctx.stroke()

  draw_notes: () ->
    @ctx.strokeStyle = "blue"
    radius = @border / 2
    centery = @gutter
    for string in @fretboard
      for pos in string
        @ctx.beginPath()
        if pos is 0
          diff = @border / 2
        else
          diff = Math.pow(@ratio, pos) * @fretwidth / 2
        @ctx.arc(@xs[pos] + diff, centery, radius, 0, 2 * Math.PI)
        @ctx.fillStyle = 'green'
        @ctx.fill()
        @ctx.stroke()
      centery += @apart
    console.log "notes!"

  draw: () ->
    @draw_fretboard()
    @draw_strings()
    @draw_notes()


class Fretboard

  constructor: (@strings) ->

  get: (note, chord) ->
    ###
    Returns the full fretboard, string by string.
    So, a C major on the ukelele would be:
    [
      [0, 5, 9, 12, ...]  # G string (7)
      [0, 4, 7, 12, ...]  # C string (0)
      [0, 3, 8, 12, ...]  # E string (4)
      [0, 3, 7, 12, ...]  # A string (9)
    ]
    ###
    full_chord = get_full_chord(note, chord)

    ret = []
    for s in @strings
      sret = []
      for n in [0..17]
        if full_chord.indexOf(s + n) > -1
          sret.push n
      ret.push sret
    ret


main = () ->
  # ukelele
  strings = [67, 60, 64, 69]
  fb = new Fretboard(strings)
  fbc = new FretboardCanvas(fb.get("F", "maj"))
  fbc = new FretboardCanvas(fb.get("G", "maj"))
  document.body.appendChild fbc.canvas
  fbc.canvas.className = "full"
  fbc.draw()

window.onload = main
