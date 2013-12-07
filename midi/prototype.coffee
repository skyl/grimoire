tempo = 80
beats_per_second = tempo / 60
seconds_per_beat = 1 / beats_per_second
ms_per_beat = seconds_per_beat * 1000

console.log seconds_per_beat
console.log ms_per_beat

limit_notes = (notes) ->
  (n for n in notes when 100 > n > 20)

# A min7
notes = [
  9, 0, 4, 7, 21, 12, 16, 19, 33, 24, 28, 31, 45, 36, 40, 43, 57, 48, 52, 55,
  69, 60, 64, 67, 81, 72, 76, 79, 93, 84, 88, 91, 105, 96, 100, 103, 117, 108,
  112, 115, 129, 120, 124, 127
]
window.notes = limit_notes notes

# G maj
notes2 = [
  7, 11, 2, 19, 23, 14, 31, 35, 26, 43, 47, 38, 55, 59, 50, 67, 71, 62, 79, 83,
  74, 91, 95, 86, 103, 107, 98, 115, 119, 110, 127, 131, 122
]
window.notes2 = limit_notes notes2

callback = () ->
  delay = 0
  sustain = seconds_per_beat / 2
  #for note in notes
  #  MIDI.noteOn(0, note, 127, delay)
  #  MIDI.noteOff(0, note, delay + sustain)
  #  delay += seconds_per_beat

  console.log notes, notes2
  MIDI.chordOn(0, notes, 127, 0)
  MIDI.chordOff(0, notes, seconds_per_beat)
  MIDI.chordOn(0, notes2, 80, seconds_per_beat)
  MIDI.chordOff(0, notes2, seconds_per_beat * 2)

main = () ->
  MIDI.loadPlugin {
    soundfontUrl: "MIDI.js/soundfont/"
    instrument: "acoustic_grand_piano"
    callback: callback
  }

window.onload = main
