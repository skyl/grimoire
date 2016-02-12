// Generated by CoffeeScript 1.9.3
(function() {
  var BASIC_MINOR_SONG, CommaPlayer, Fretboard, FretboardCanvas, FullChordPlayer, I_ONCE_KNEW_A_PRETTY_GIRL, MOST_BASIC_SONG, OscillatorPlayer, RandomArpPlayer, SILVER_DAGGER, STARIN_AT_THE_WALLS, START_SONG, TWINKLE, UpbeatChordPlayer, WAGON_WHEEL, chord_notes, full_c, get_full_chord, instruments, limit_notes, trans,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  full_c = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];

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
    "B": 11
  };

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
    "a": [0, 2, 3, 5, 7, 8, 10],
    "d": [0, 2, 3, 5, 7, 9, 10]
  };

  window.color_map = MusicTheory.Synesthesia.map();

  get_full_chord = function(chord_name) {
    var a, chord, cns, concatenated, full_chords, n, note, split, tcn, tcns, tn;
    split = chord_name.trim().split(" ");
    note = split[0];
    chord = split[1];
    tn = trans[note];
    cns = chord_notes[chord] || [0, 4, 7];
    tcns = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = cns.length; j < len; j++) {
        n = cns[j];
        results.push((n + tn) % 12);
      }
      return results;
    })();
    full_chords = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = full_c.length; j < len; j++) {
        n = full_c[j];
        results.push((function() {
          var l, len1, results1;
          results1 = [];
          for (l = 0, len1 = tcns.length; l < len1; l++) {
            tcn = tcns[l];
            results1.push(n + tcn);
          }
          return results1;
        })());
      }
      return results;
    })();
    a = new Array;
    concatenated = full_chords.concat.apply(a, full_chords);
    return concatenated;
  };

  FretboardCanvas = (function() {
    function FretboardCanvas(id, fretboard) {
      this.fretboard = fretboard;
      this.draw = bind(this.draw, this);
      this.canvas = document.getElementById(id);
      window.canvas = this.canvas;
      this.width = this.canvas.width = this.canvas.offsetWidth;
      this.height = this.canvas.height = this.canvas.offsetHeight;
      this.ctx = this.canvas.getContext("2d");
      this.ctx.font = "20pt Arial";
      this.calculate();
    }

    FretboardCanvas.prototype.calculate = function() {
      this.fretwidth = this.width / 10;
      this.border = this.fretwidth / 2;
      this.maxx = this.width - this.border;
      this.maxy = this.height - this.border;
      this.num_strings = this.fretboard.strings.length;
      return this.set_xs();
    };

    FretboardCanvas.prototype.set_xs = function() {
      var fretwidth, results, wherex;
      this.xs = [];
      this.ratio = 1 / Math.pow(2, 1 / 12);
      fretwidth = this.fretwidth;
      wherex = this.maxx;
      results = [];
      while (wherex > 0) {
        this.xs.push(wherex);
        wherex = wherex - fretwidth;
        results.push(fretwidth = fretwidth * this.ratio);
      }
      return results;
    };

    FretboardCanvas.prototype.draw_fretboard = function() {
      var j, len, ref, x;
      this.ctx.beginPath();
      this.ctx.strokeStyle = "gray";
      ref = this.xs;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        this.ctx.moveTo(x, this.border);
        this.ctx.lineTo(x, this.height - this.border);
      }
      return this.ctx.stroke();
    };

    FretboardCanvas.prototype.draw_strings = function() {
      var wherey;
      this.ctx.beginPath();
      this.ctx.strokeStyle = "gold";
      this.apart = (this.height - this.border * 2) / this.num_strings;
      this.gutter = this.border + this.apart / 2;
      wherey = this.gutter;
      while (wherey < this.height - this.border) {
        this.ctx.moveTo(0, wherey);
        this.ctx.lineTo(this.maxx, wherey);
        wherey += this.apart;
      }
      return this.ctx.stroke();
    };

    FretboardCanvas.prototype.draw_notes = function() {
      var centery, diff, i, j, l, len, len1, pos, radius, ref, results, string;
      this.ctx.strokeStyle = "blue";
      radius = this.fretwidth / 3;
      centery = this.gutter;
      ref = this.fb_state;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        string = ref[i];
        for (l = 0, len1 = string.length; l < len1; l++) {
          pos = string[l];
          this.ctx.beginPath();
          if (pos === 0) {
            diff = this.border / 2;
          } else {
            diff = Math.pow(this.ratio, pos) * this.fretwidth / 2;
          }
          this.ctx.arc(this.xs[pos] + diff, centery, radius, 0, 2 * Math.PI);
          this.ctx.fillStyle = color_map[(this.fretboard.strings[i] + pos) % 88].hex;
          this.ctx.fill();
          this.ctx.stroke();
        }
        results.push(centery += this.apart);
      }
      return results;
    };

    FretboardCanvas.prototype.draw_text = function() {
      this.ctx.fillStyle = color_map[trans[this.chord_name.split(" ")[0].trim()] % 88];
      return this.ctx.fillText(this.chord_name, 10, 50);
    };

    FretboardCanvas.prototype.replace = function(chord_name) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.fb_state = this.fretboard.get(chord_name);
      this.chord_name = chord_name;
      return this.draw();
    };

    FretboardCanvas.prototype.draw = function() {
      this.draw_fretboard();
      this.draw_strings();
      this.draw_notes();
      return this.draw_text();
    };

    return FretboardCanvas;

  })();

  Fretboard = (function() {
    function Fretboard(strings) {
      this.strings = strings;
    }

    Fretboard.prototype.get = function(chord_name) {

      /*
      chord_name comes as string like "G min "
      
      Returns the full fretboard, string by string.
      So, a C major on the ukelele would be:
      [
        [0, 5, 9, 12, ...]  # G string (7)
        [0, 4, 7, 12, ...]  # C string (0)
        [0, 3, 8, 12, ...]  # E string (4)
        [0, 3, 7, 12, ...]  # A string (9)
      ]
       */
      var full_chord, j, l, len, n, ref, ret, s, sret;
      full_chord = get_full_chord(chord_name);
      ret = [];
      ref = this.strings;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        sret = [];
        for (n = l = 0; l <= 17; n = ++l) {
          if (full_chord.indexOf(s + n) > -1) {
            sret.push(n);
          }
        }
        ret.push(sret);
      }
      return ret;
    };

    return Fretboard;

  })();

  TWINKLE = "C,,,,,,,,F,,,,C,,,,F,,,,C,,,,G,,,,C,,,,\nC,,,,F,,,,C,,,,G,,,,\nC,,,,F,,,,C,,,,G,,,,";

  I_ONCE_KNEW_A_PRETTY_GIRL = 'G min,,,,,,C min,,,,,\nG min,,,Bb maj,,,D 7,,,G min,,,\nG min,,,D 7,,,G min,,,\nG min,,,,,,,,,,\nC min,,,,,,,,\nG min,,,,,,,,\nD,,,,,,,,\nG min,,,,,,,,\nD 7,,,,,,,,\nG min,,,,,,,,';

  STARIN_AT_THE_WALLS = 'B,,,,,,,,B maj7,,,,,,,,B 7,,,,,,,,E,,,E 7,,,,,\nB,,,,,,,,B maj7,,,,,,,,B 7,,,,,,,,E,,,E 7,,,,,\nF#,,,,E,,,,G,,,,B,,,,F#,,,,E,,,,D,,,B,,,,,\nF#,,,,E,,,,D,,F#,,,,,,B,,,,';

  WAGON_WHEEL = "C,,G,,A min,,F,,";

  BASIC_MINOR_SONG = "C min,,G min,,\nC min,,G min,,\nC min,,G min,,\nF min,,G min,,\nC min,,G min,,\nEb,,G min,,\nC min,,G min,,\nF min,,Bb,,";

  MOST_BASIC_SONG = "C,,G,,";

  SILVER_DAGGER = "F,,,,,,,,Bb,,,,,,,,F,,,,,,,,G min,,,,,,,,\nEb,,,,,,,C min,,,,,,,,G min,,,,Eb,,,,F,,,,,,,,";

  START_SONG = WAGON_WHEEL;

  CommaPlayer = (function() {
    function CommaPlayer(fbc, comma_song, metronome1, loop, low1, high1) {
      this.fbc = fbc;
      this.comma_song = comma_song;
      this.metronome = metronome1;
      this.loop = loop != null ? loop : false;
      this.low = low1 != null ? low1 : 20;
      this.high = high1 != null ? high1 : 100;
      this.position = 0;
      this.calculate();
    }

    CommaPlayer.prototype.calculate = function() {
      this.chords = this.comma_song.split(",");
      this.chords.pop();
      return this.chord = this.chords[this.position] || this.chord;
    };

    CommaPlayer.prototype.play = function(current_tick, time) {
      if (current_tick % 24) {
        return;
      }
      if (this.position >= this.chords.length) {
        if (this.loop) {
          this.position = 0;
        } else {
          this.stop();
        }
      }
      this.chord = (this.chords[this.position] || this.chord).trim();
      this.fbc.replace(this.chord);
      return this.position += 1;
    };

    return CommaPlayer;

  })();

  limit_notes = function(notes, low, high) {
    var j, len, n, results;
    if (low == null) {
      low = 20;
    }
    if (high == null) {
      high = 100;
    }
    results = [];
    for (j = 0, len = notes.length; j < len; j++) {
      n = notes[j];
      if ((high >= n && n >= low)) {
        results.push(n);
      }
    }
    return results;
  };

  FullChordPlayer = (function(superClass) {
    extend(FullChordPlayer, superClass);

    function FullChordPlayer() {
      return FullChordPlayer.__super__.constructor.apply(this, arguments);
    }

    FullChordPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var notes, sustain;
      FullChordPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (current_tick % 24) {
        return;
      }
      sustain = metronome.seconds_per_tick * 24;
      notes = limit_notes(get_full_chord(this.chord), this.low, this.high);
      MIDI.chordOn(0, notes, 35, time);
      return MIDI.chordOff(0, notes, time + sustain);
    };

    return FullChordPlayer;

  })(CommaPlayer);

  UpbeatChordPlayer = (function(superClass) {
    extend(UpbeatChordPlayer, superClass);

    function UpbeatChordPlayer() {
      return UpbeatChordPlayer.__super__.constructor.apply(this, arguments);
    }

    UpbeatChordPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var notes, start, sustain;
      UpbeatChordPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if ((current_tick + 12) % 24) {
        return;
      }
      sustain = metronome.seconds_per_tick * 12;
      start = time - metronome.audioContext.currentTime;
      notes = limit_notes(get_full_chord(this.chord), this.low, this.high);
      MIDI.chordOn(0, notes, 30, start);
      return MIDI.chordOff(0, notes, start + sustain);
    };

    return UpbeatChordPlayer;

  })(CommaPlayer);

  RandomArpPlayer = (function(superClass) {
    extend(RandomArpPlayer, superClass);

    function RandomArpPlayer() {
      return RandomArpPlayer.__super__.constructor.apply(this, arguments);
    }

    RandomArpPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var notes, rand, start, sustain;
      RandomArpPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (current_tick % 12) {
        return;
      }
      sustain = metronome.seconds_per_tick * 6;
      start = time - metronome.audioContext.currentTime;
      notes = limit_notes(get_full_chord(this.chord), this.low, this.high);
      rand = notes[Math.floor(Math.random() * notes.length)];
      MIDI.noteOn(0, rand, Math.random() * 127, start);
      return MIDI.noteOff(0, rand, start + sustain);
    };

    return RandomArpPlayer;

  })(CommaPlayer);

  window.midi_to_freq = function(n) {
    n -= 57;
    return Math.pow(2, n / 12) * 440;
  };

  OscillatorPlayer = (function(superClass) {
    extend(OscillatorPlayer, superClass);

    function OscillatorPlayer() {
      return OscillatorPlayer.__super__.constructor.apply(this, arguments);
    }

    OscillatorPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var ac, freq, gNode, notes, osc, suss;
      OscillatorPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (current_tick % 6) {
        return;
      }
      notes = limit_notes(get_full_chord(this.chord), this.low, this.high);
      ac = metronome.audioContext;
      freq = midi_to_freq(notes[Math.floor(Math.random() * notes.length)]);
      suss = 120 / tempo * .125;
      osc = ac.createOscillator();
      gNode = ac.createGain();
      osc.connect(gNode);
      gNode.gain.value = 0.05;
      gNode.connect(ac.destination);
      osc.frequency.value = freq;
      osc.start(time);
      return osc.stop(time + suss);
    };

    return OscillatorPlayer;

  })(CommaPlayer);

  instruments = {
    "bass": [28, 33, 38, 43],
    "cuatro": [57, 62, 66, 59],
    "guitar": [40, 45, 50, 55, 59, 64],
    "mandolin": [55, 62, 69, 76],
    "ukelele": [67, 60, 64, 69]
  };

  window.fretboardApp = angular.module('fretboardApp', []);

  fretboardApp.controller('FretboardChanger', function($scope, $location) {
    var DEFAULTS, search, set_search;
    window.$location = $location;
    window.$scope = $scope;
    $scope.instruments = instruments;
    DEFAULTS = {
      instrument: "guitar",
      comma_song: START_SONG,
      limit_notes: false,
      tempo: 45,
      loop: true,
      lookahead: 20
    };
    search = $location.search();
    Object.keys(DEFAULTS).forEach(function(k) {
      if (!search[k]) {
        return search[k] = DEFAULTS[k];
      }
    });
    $location.search(search);
    angular.extend($scope, search);
    $scope.metronome = new Metronome({
      tempo: $scope.tempo,
      lookahead: $scope.lookahead,
      schedule_ahead_time: .1
    });
    $scope.playing = $scope.metronome.playing;
    set_search = function(key, value) {
      search = $location.search();
      search[key] = value;
      return $location.search(search);
    };
    $scope.tempo_change = function() {
      set_search("tempo", $scope.tempo);
      return $scope.metronome.tempo = $scope.tempo;
    };
    $scope.click_play_pause = function() {
      $scope.playing = $scope.metronome.is_playing = !$scope.metronome.is_playing;
      if (!$scope.playing) {
        return $scope.metronome.stop();
      } else {
        return $scope.metronome.start();
      }
    };
    $scope.instrument_change = function() {
      $scope.fb.strings = $scope.instruments[$scope.instrument];
      $scope.fbc.calculate();
      $scope.limit_notes_change();
      search = $location.search();
      search.instrument = $scope.instrument;
      return $location.search(search);
    };
    $scope.limit_notes_change = function() {
      var instrL, j, len, p, ref, results;
      instrL = $scope.instruments[$scope.instrument];
      set_search('limit_notes', $scope.limit_notes);
      ref = $scope.metronome.players;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        p = ref[j];
        if ($scope.limit_notes) {
          p.low = Math.min.apply(null, instrL);
          results.push(p.high = Math.min((Math.max.apply(null, instrL)) + 12));
        } else {
          p.low = 20;
          results.push(p.high = 100);
        }
      }
      return results;
    };
    $scope.comma_song_keyup = function() {
      var j, len, p, ref, results;
      set_search('comma_song', $scope.comma_song);
      ref = $scope.metronome.players;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        p = ref[j];
        p.comma_song = $scope.comma_song;
        results.push(p.calculate());
      }
      return results;
    };
    $scope.init = function() {
      $scope.fb = new Fretboard($scope.instruments[$scope.instrument]);
      $scope.fbc = new FretboardCanvas("fretboard", $scope.fb);
      $scope.metronome.players = [new UpbeatChordPlayer($scope.fbc, $scope.comma_song, $scope.metronome, $scope.loop), new RandomArpPlayer($scope.fbc, $scope.comma_song, $scope.metronome, $scope.loop), new OscillatorPlayer($scope.fbc, $scope.comma_song, $scope.metronome, $scope.loop, 0, 100)];
      $scope.limit_notes_change();
      return $scope.fbc.replace($scope.comma_song.split(",")[0]);
    };
    $scope.pause = function() {
      return $scope.metronome.stop();
    };
    $scope.play = function() {
      return $scope.metronome.start();
    };
    return MIDI.loadPlugin({
      soundfontUrl: "modules/MIDI.js/soundfont/",
      instrument: "acoustic_grand_piano",
      callback: $scope.init
    });
  });

  fretboardApp.config(function($locationProvider) {
    return $locationProvider.html5Mode(true).hashPrefix('!');
  });

}).call(this);
