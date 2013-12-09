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
  "aug": [0, 4, 8],
  "aug7": [0, 4, 8, 10],
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

  constructor: (id, @fretboard) ->
    @canvas = document.getElementById id
    window.canvas = @canvas
    @width = @canvas.width = @canvas.offsetWidth
    @height = @canvas.height = @canvas.offsetHeight
    @ctx = @canvas.getContext "2d"
    @ctx.font = "20pt Arial"
    @calculate()

  calculate: () ->
    # largest fret and border calculated from that
    # magic 8 means there will be about 9 frets
    # magic 10 means there will be about 13 frets
    # FIXME.
    @fretwidth = @width / 10
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
    radius = @fretwidth / 3
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
    n = trans[@chord_name.split(" ")[0].trim()]
    @ctx.fillStyle = color_map[n].hex
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
    chord_name comes as string like "G min "

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


TWINKLE = """
C,,,,,,,,F,,,,C,,,,F,,,,C,,,,G,,,,C,,,,
C,,,,F,,,,C,,,,G,,,,
C,,,,F,,,,C,,,,G,,,,
"""

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

WAGON_WHEEL = "C,,G,,A min,,F,,"

BASIC_MINOR_SONG = """
C min,,G min,,
C min,,G min,,
C min,,G min,,
F min,,G min,,
C min,,G min,,
Eb,,G min,,
C min,,G min,,
F min,,Bb,,
"""
MOST_BASIC_SONG = "C,,G,,"
SILVER_DAGGER = """
F,,,,,,,,Bb,,,,,,,,F,,,,,,,,G min,,,,,,,,
Eb,,,,,,,C min,,,,,,,,G min,,,,Eb,,,,F,,,,,,,,
"""

START_SONG = SILVER_DAGGER

class CommaPlayer

  constructor: (@fbc, @comma_song, @tempo, @loop=false, @low=20, @high=100) ->
    @position = 0
    @calculate()

  calculate: () ->
    @chords = @comma_song.split(",")
    @chords.pop()  # trailing comma ..
    @chord = @chords[@position] || @chord
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
    if @position >= @chords.length
      if @loop
        @position = 0
      else
        @stop()
    @chord = (@chords[@position] || @chord).trim()
    @fbc.replace(@chord)
    @play_beat()
    @position += 1

  play_beat: () ->
    console.log "Subclasses implement"


limit_notes = (notes, low=20, high=100) ->
  (n for n in notes when high >= n >= low)


class FullChordPlayer extends CommaPlayer

  play_beat: () ->
    sustain = @seconds_per_beat / 8
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    MIDI.chordOn(0, notes, 40, 0)
    MIDI.chordOff(0, notes, sustain)


class UpbeatChordPlayer extends CommaPlayer

  play_beat: () ->
    sustain = @seconds_per_beat / 8
    start = @seconds_per_beat / 2
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    MIDI.chordOn(0, notes, 40, start)
    MIDI.chordOff(0, notes, start + sustain)


class RandomArpPlayer extends CommaPlayer

  play_beat: () ->
    sustain = @seconds_per_beat / 2
    sixteenth = @seconds_per_beat / 4
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    place = 0
    while place < @seconds_per_beat
      rand = notes[Math.floor(Math.random() * notes.length)]
      MIDI.noteOn(0, rand, Math.random() * 127, place)
      MIDI.noteOff(0, rand, place + sustain)
      place += sixteenth

instruments = {
  "guitar": [40, 45, 50, 55, 59, 64],
  "bass": [28, 33, 38, 43],
  "ukelele": [67, 60, 64, 69],
}

window.fretboardApp = angular.module 'fretboardApp', []
fretboardApp.controller 'FretboardChanger', ($scope) ->
  window.scope = $scope
  $scope.instruments = instruments
  $scope.instrument = instruments["ukelele"]
  $scope.comma_song = START_SONG
  $scope.tempo = 42
  $scope.limit_notes = false
  $scope.loop = true

  $scope.instrument_change = () ->
    $scope.fb.strings = $scope.instrument
    $scope.fbc.calculate()
    $scope.limit_notes_change()
  $scope.limit_notes_change = () ->
    for p in $scope.players
      if $scope.limit_notes
        p.low = Math.min.apply null, $scope.instrument
        p.high = (Math.min.apply null, $scope.instrument) + 12
      else
        p.low = 20
        p.high = 100
  $scope.comma_song_keyup = () ->
    if $scope.players[0].comma_song isnt $scope.comma_song
      for p in $scope.players
        p.comma_song = $scope.comma_song
        p.calculate()
  $scope.tempo_change = () ->
    for p in $scope.players
      p.tempo = $scope.tempo
      p.stop()
      p.calculate()
      p.start()
  $scope.loop_change = () ->
    for p in $scope.players
      p.loop = $scope.loop

  $scope.start = () ->
    $scope.fb = new Fretboard $scope.instrument
    $scope.fbc = new FretboardCanvas "fretboard", $scope.fb
    $scope.players = [
      new UpbeatChordPlayer($scope.fbc, $scope.comma_song, $scope.tempo, $scope.loop),
      new RandomArpPlayer($scope.fbc, $scope.comma_song, $scope.tempo, $scope.loop)
    ]
    for p in $scope.players
      p.start()
  MIDI.loadPlugin {
    soundfontUrl: "modules/MIDI.js/soundfont/"
    instrument: "acoustic_grand_piano"
    callback: $scope.start
  }
