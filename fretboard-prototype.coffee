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
  "min": [0, 3, 7],
  "dim": [0, 3, 6],
  "aug": [0, 4, 8],

  "7": [0, 4, 7, 10],
  "maj7": [0, 4, 7, 11],
  "min7": [0, 3, 7, 10],
  "dim7": [0, 3, 6, 10],
  "aug7": [0, 4, 8, 10],

  "major": [0, 2, 4, 5, 7, 9, 11],
  "a": [0, 2, 3, 5, 7, 8, 10],  # aeolian
  "d": [0, 2, 3, 5, 7, 9, 10],  # dorian

}

window.color_map = MusicTheory.Synesthesia.map()

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
    @ctx.strokeStyle = "gray"
    for x in @xs
      @ctx.moveTo x, @border
      @ctx.lineTo x, @height - @border
    @ctx.stroke()

  draw_strings: () ->
    @ctx.beginPath()
    @ctx.strokeStyle = "gold"
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
        @ctx.fillStyle = color_map[(@fretboard.strings[i] + pos) % 88].hex
        @ctx.fill()
        @ctx.stroke()
      centery += @apart

  draw_text: () ->
    # color_map has 89 keys
    @ctx.fillStyle = color_map[trans[@chord_name.split(" ")[0].trim()] % 88]
    @ctx.fillText(@chord_name, 10, 50)

  clear: () =>
    @ctx.clearRect 0, 0, @width, @height

  replace: (chord_name) ->
    @clear()
    chord_name = chord_name or @chord_name
    @fb_state = @fretboard.get(chord_name)
    @chord_name = chord_name
    @draw()

  draw: () =>
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

DEFAULT_SONG = "C,,G 7,,A min7,,F,,"

class CommaPlayer

  # TODO: standard options?
  constructor: (@comma_song, @metronome, @scope, @options) ->
    @position = 0
    @calculate()
    @options = @options or {}

  calculate: () ->
    # remove new lines
    @comma_song = @comma_song.replace(/(\r\n|\n|\r)/gm, "")
    @chords = @comma_song.split(",")
    @chords.pop()  # trailing comma ..
    @chord = @chords[@position] || @chord

  play: (current_tick, time) ->
    # play the quarter
    if (current_tick % 24)
      return
    #console.log time, @metronome.audioContext.currentTime
    # we can show the chord 80ms early .. that makes it special.
    # if we wanted to be exact, we would need to schedule the
    # canvas to replace after waiting time - currentTime seconds.
    if @position >= @chords.length
      @position = 0

    @chord = (@chords[@position] || @chord).trim()
    @position += 1


class FretboardCommaPlayer extends CommaPlayer
  # must set fbc before calling play :/
  play: (current_tick, time, tempo, metronome) ->
    super current_tick, time, tempo, metronome
    if (not (current_tick % 24))
      @fbc.replace(@chord)


limit_notes = (notes, low=20, high=100) ->
  (n for n in notes when high >= n >= low)


class FullChordPlayer extends CommaPlayer

  play: (current_tick, time, tempo, metronome) ->
    super current_tick, time, tempo, metronome
    if (current_tick % 24)
      return
    sustain = metronome.seconds_per_tick * 24
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    MIDI.chordOn(0, notes, 35, time)
    MIDI.chordOff(0, notes, time + sustain)


class UpbeatChordPlayer extends CommaPlayer

  play: (current_tick, time, tempo, metronome) ->
    super current_tick, time, tempo, metronome
    if @off
      return
    if (current_tick + 12 ) % 24
      return
    sustain = metronome.seconds_per_tick * 12
    start = time - metronome.audioContext.currentTime
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    MIDI.chordOn(0, notes, 30, start)
    MIDI.chordOff(0, notes, start + sustain)


class RandomArpPlayer extends CommaPlayer

  play: (current_tick, time, tempo, metronome) ->
    super current_tick, time, tempo, metronome
    if (current_tick % 12)
      return
    # 16th
    sustain = metronome.seconds_per_tick * 6
    start = time - metronome.audioContext.currentTime
    notes = limit_notes(get_full_chord(@chord), @low, @high)
    rand = notes[Math.floor(Math.random() * notes.length)]
    MIDI.noteOn(0, rand, Math.random() * 127, start)
    MIDI.noteOff(0, rand, start + sustain)

window.midi_to_freq = (n) ->
  n -= 57  # woo woo 57 == 440
  Math.pow(2, n / 12) * 440



# getOsc
class OscillatorPlayer extends CommaPlayer

  play: (current_tick, time, tempo, metronome) ->
    super current_tick, time, tempo, metronome

    if @off
      return

    if (current_tick % (@options.tick_multiple or 6))
      return

    @options.sustain = @options.sustain or 2
    sustain = 60 * @options.sustain / tempo * 0.125
    @options.gain = @options.gain or 0.2
    gain = @options.gain / 10

    notes = limit_notes(get_full_chord(@chord), @low, @high)
    ac = metronome.audioContext
    freq = midi_to_freq notes[Math.floor(Math.random() * notes.length)]
    osc = ac.createOscillator()
    gNode = ac.createGain()
    osc.connect gNode
    gNode.gain.value = gain
    gNode.connect ac.destination
    osc.frequency.value = freq
    osc.start time
    osc.stop time + sustain


instruments = {
  "bass": [28, 33, 38, 43],
  "cuatro": [57, 62, 66, 59],
  "guitar": [40, 45, 50, 55, 59, 64],
  "mandolin": [55, 62, 69, 76],
  "ukelele": [67, 60, 64, 69],
}

window.fretboardApp = angular.module 'fretboardApp', []
fretboardApp.controller 'FretboardChanger', ($scope, $location) ->
  # debug
  window.$location = $location
  window.$scope = $scope
  # constants
  $scope.instruments = instruments

  DEFAULTS = {
    instrument: "guitar"
    comma_song: DEFAULT_SONG
    limit_notes: false
    tempo: 45
    # questionables for revamp
    loop: true
    # metronome init?
    lookahead: 20
    # playing: false
    oscillator_on: true
    oscillator_sustain: 2
    oscillator_gain: 0.2
    oscillator_tick_multiple: 6
  }
  search = $location.search()
  Object.keys(DEFAULTS).forEach (k) ->
    if not search[k] then search[k] = DEFAULTS[k]
  # some sites erroneously encode %20 to +
  # maybe try to upgrade angular? custom encode/decode?
  search.comma_song = search.comma_song.replace(/\+/g, ' ')
  $location.search(search)
  angular.extend($scope, search)

  $scope.metronome = new Metronome {
    tempo: $scope.tempo
    lookahead: $scope.lookahead
    schedule_ahead_time: .1
  }
  $scope.playing = $scope.metronome.playing

  set_search = (key, value) ->
    search = $location.search()
    search[key] = value
    $location.search search

  $scope.tempo_change = () ->
    set_search "tempo", $scope.tempo
    $scope.metronome.tempo = $scope.tempo

  $scope.click_play_pause = () ->
    $scope.playing = $scope.metronome.is_playing = !$scope.metronome.is_playing
    if !$scope.playing
      $scope.metronome.stop()
    else
      $scope.metronome.start()

  $scope.instrument_change = () ->
    $scope.fb.strings = $scope.instruments[$scope.instrument]
    $scope.fbc.calculate()
    $scope.fbc.replace()
    $scope.limit_notes_change()
    search = $location.search()
    search.instrument = $scope.instrument
    $location.search(search)

  $scope.limit_notes_change = () ->
    instrL = $scope.instruments[$scope.instrument]
    set_search 'limit_notes', $scope.limit_notes
    for p in $scope.metronome.players
      if (String($scope.limit_notes) is 'true')
        p.low = Math.min.apply null, instrL
        p.high = Math.min(
          (Math.max.apply null, instrL) + 12
        )
      else
        p.low = 20
        p.high = 100

  $scope.comma_song_keyup = () ->
    set_search 'comma_song', $scope.comma_song
    # if $scope.metronome.players[0].comma_song isnt $scope.comma_song
    for p in $scope.metronome.players
      p.comma_song = $scope.comma_song
      p.calculate()


  $scope.oscillator_on_change = () ->
    $scope.oscillator_player.off = !$scope.oscillator_on

  $scope.oscillator_sustain_change = () ->
    $scope.oscillator_player.options.sustain =
      Number($scope.oscillator_sustain)

  $scope.oscillator_gain_change = () ->
    $scope.oscillator_player.options.gain =
      Number($scope.oscillator_gain)

  $scope.oscillator_tick_multiple_change = () ->
    $scope.oscillator_player.options.tick_multiple =
      Number($scope.oscillator_tick_multiple)

  $scope.chords_on_change = () ->
    $scope.chord_player.off = !$scope.chords_on


  $scope.init = () ->
    $scope.fb = new Fretboard $scope.instruments[$scope.instrument]
    $scope.fbc = new FretboardCanvas "fretboard", $scope.fb

    # why am I passing this `$scope.loop` around everywhere like this?
    $scope.fbcp = new FretboardCommaPlayer(
      $scope.comma_song, $scope.metronome, $scope.loop)
    $scope.fbcp.fbc = $scope.fbc

    $scope.oscillator_player = new OscillatorPlayer(
      $scope.comma_song, $scope.metronome, $scope)

    $scope.chord_player = new UpbeatChordPlayer(
      $scope.comma_song, $scope.metronome, $scope)


    $scope.metronome.players = [
      $scope.fbcp
      new RandomArpPlayer($scope.comma_song, $scope.metronome, $scope)
      $scope.chord_player
      $scope.oscillator_player
    ]
    $scope.limit_notes_change()
    $scope.fbc.replace $scope.comma_song.split(",")[0]

  $scope.pause = () ->
    $scope.metronome.stop()
  $scope.play = () ->
    $scope.metronome.start()

  MIDI.loadPlugin {
    soundfontUrl: "modules/MIDI.js/soundfont/"
    instrument: "acoustic_grand_piano"
    callback: $scope.init
  }

fretboardApp.config ($locationProvider) ->
  $locationProvider.html5Mode(true).hashPrefix('!')
