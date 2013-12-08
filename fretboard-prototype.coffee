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
  "": [0, 4, 7],
  "maj": [0, 4, 7],
  "7": [0, 4, 7, 10],
  "maj7": [0, 4, 7, 11],
  "min": [0, 3, 7],
  "min7": [0, 3, 7, 10],
  "dim": [0, 3, 6],
  "dim7": [0, 3, 6, 10],
}

color_map = MusicTheory.Synesthesia.map()

get_full_chord = (chord_name) ->
  split = chord_name.trim().split(" ")
  note = split[0]
  chord = split[1]
  tn = trans[note]
  cns = chord_notes[chord] || [0, 4, 7]
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
    @num_strings = @fretboard.strings.length
    @set_xs()

  set_xs: () ->
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
    while wherey < @height - @border
      @ctx.moveTo 0, wherey
      @ctx.lineTo @maxx, wherey
      wherey += @apart
    @ctx.stroke()

  draw_notes: () ->
    @ctx.strokeStyle = "blue"
    radius = @apart / 2
    centery = @gutter
    for string, i in @fb_state
      for pos in string
        @ctx.beginPath()
        if pos is 0
          diff = @border / 2
        else
          diff = Math.pow(@ratio, pos) * @fretwidth / 2
        @ctx.arc(@xs[pos] + diff, centery, radius, 0, 2 * Math.PI)
        @ctx.fillStyle = color_map[@fretboard.strings[i] + pos].hex
        @ctx.fill()
        @ctx.stroke()
      centery += @apart

  draw_text: () ->
    @ctx.fillText(@chord_name, 10, 50)

  replace: (chord_name) ->
    @ctx.clearRect 0, 0, @width, @height
    @fb_state = @fretboard.get(chord_name)
    @chord_name = chord_name
    @draw()

  draw: () ->
    @draw_fretboard()
    @draw_strings()
    @draw_notes()
    @draw_text()


class Fretboard

  constructor: (@strings) ->

  get: (chord_name) ->
    ###
    chord comes as string like "G min "

    Returns the full fretboard, string by string.
    So, a C major on the ukelele would be:
    [
      [0, 5, 9, 12, ...]  # G string (7)
      [0, 4, 7, 12, ...]  # C string (0)
      [0, 3, 8, 12, ...]  # E string (4)
      [0, 3, 7, 12, ...]  # A string (9)
    ]
    ###
    full_chord = get_full_chord(chord_name)
    ret = []
    for s in @strings
      sret = []
      for n in [0..17]
        if full_chord.indexOf(s + n) > -1
          sret.push n
      ret.push sret
    ret


I_ONCE_KNEW_A_PRETTY_GIRL = '''
G min,,,,,,C min,,,,,
G min,,,Bb maj,,,D 7,,,G min,,,
G min,,,D 7,,,G min,,,
G min,,,,,,,,,,
C min,,,,,,,,
G min,,,,,,,,
D,,,,,,,,
G min,,,,,,,,
D 7,,,,,,,,
G min,,,,,,,,
'''

STARIN_AT_THE_WALLS = '''
B,,,,,,,,B maj7,,,,,,,,B 7,,,,,,,,E,,,E 7,,,,,
B,,,,,,,,B maj7,,,,,,,,B 7,,,,,,,,E,,,E 7,,,,,
F#,,,,E,,,,G,,,,B,,,,F#,,,,E,,,,D,,,B,,,,,
F#,,,,E,,,,D,,F#,,,,,,B,,,,
'''

class CommaPlayer

  constructor: (@fbc, @comma_song, @tempo, @loop=false) ->
    @chords = @comma_song.split(",")
    @position = 0
    @chord = @chords[@position]

    @beats_per_second = @tempo / 60
    @seconds_per_beat = 1 / @beats_per_second
    @ms_per_beat = @seconds_per_beat * 1000

  start: () ->
    self = this
    @timer = setInterval ()->
      self.advance()
    , @ms_per_beat

  stop: () ->
    clearInterval @timer

  advance: () =>
    #console.log "advance"
    @chord = @chords[@position].trim() || @chord
    @fbc.replace(@chord)

    @position += 1
    if @position >= @chords.length
      if @loop
        @position = 0
      else
        @stop()
    @play_beat()

  play_beat: () ->
    console.log "Subclasses implement"


limit_notes = (notes) -> (n for n in notes when 100 > n > 20)

class FullChordPlayer extends CommaPlayer

  play_beat: () ->
    sustain = @seconds_per_beat / 2
    notes = limit_notes get_full_chord @chord
    MIDI.chordOn(0, notes, 60, 0)
    MIDI.chordOff(0, notes, @sustain)

class RandomArpPlayer extends CommaPlayer

  play_beat: () ->
    sustain = @seconds_per_beat / 2
    sixteenth = @seconds_per_beat / 4
    notes = limit_notes get_full_chord @chord
    place = 0
    #console.log notes
    #console.log place, @seconds_per_beat
    while place < @seconds_per_beat
      #console.log place, @seconds_per_beat
      rand = notes[Math.floor(Math.random() * notes.length)]
      MIDI.noteOn(0, rand, Math.random() * 127, place)
      MIDI.noteOff(0, rand, place + sustain)
      place += sixteenth


main = () ->
  # guitar
  strings = [40, 45, 50, 55, 59, 64]
  # bass
  strings = [28, 33, 38, 43]
  # ukelele
  strings = [67, 60, 64, 69]
  window.fb = new Fretboard(strings)
  window.fbc = new FretboardCanvas(fb)
  document.body.appendChild fbc.canvas
  fbc.canvas.className = "full"
  #sa = new SongAnimator(fbc, STARIN_AT_THE_WALLS)
  #sa = new SongAnimator(fbc, I_ONCE_KNEW_A_PRETTY_GIRL)
  #fbc.replace("A min7")
  #window.chord_player = new FullChordPlayer(fbc, STARIN_AT_THE_WALLS, 190)
  window.chord_player = new FullChordPlayer(fbc, I_ONCE_KNEW_A_PRETTY_GIRL, 95, true)
  window.chord_player2 = new RandomArpPlayer(fbc, I_ONCE_KNEW_A_PRETTY_GIRL, 95, true)
  chord_player.start()
  chord_player2.start()

window.onload = () ->
  MIDI.loadPlugin {
    soundfontUrl: "/midi/MIDI.js/soundfont/"
    instrument: "acoustic_grand_piano"
    callback: main
  }
