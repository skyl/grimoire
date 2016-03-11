// Generated by CoffeeScript 1.9.3
(function() {
  var ChordPlayer, CommaPlayer, DEFAULT_SONG, Fretboard, FretboardCanvas, FretboardCommaPlayer, OscillatorPlayer, RandomArpPlayer, binran, chord_notes, full_c, get_full_chord, instruments, limit_notes, patternMap, trans,
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

  binran = function(p) {
    if (p == null) {
      p = 0.5;
    }
    return Math.random() < p;
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
      this.clear = bind(this.clear, this);
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

    FretboardCanvas.prototype.clear = function() {
      return this.ctx.clearRect(0, 0, this.width, this.height);
    };

    FretboardCanvas.prototype.replace = function(chord_name) {
      this.clear();
      chord_name = chord_name || this.chord_name;
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

  DEFAULT_SONG = "C,,G 7,,A min7,,F,,";

  CommaPlayer = (function() {
    function CommaPlayer(comma_song, metronome1, scope, options) {
      this.comma_song = comma_song;
      this.metronome = metronome1;
      this.scope = scope;
      this.options = options;
      this.position = 0;
      this.calculate();
      this.options = this.options || {};
    }

    CommaPlayer.prototype.calculate = function() {
      this.comma_song = this.comma_song.replace(/(\r\n|\n|\r)/gm, "");
      this.chords = this.comma_song.split(",");
      this.chords.pop();
      return this.chord = this.chords[this.position] || this.chord;
    };

    CommaPlayer.prototype.play = function(current_tick, time) {
      if (current_tick % 24) {
        return;
      }
      if (this.position >= this.chords.length) {
        this.position = 0;
      }
      this.chord = (this.chords[this.position] || this.chord).trim();
      return this.position += 1;
    };

    return CommaPlayer;

  })();

  FretboardCommaPlayer = (function(superClass) {
    extend(FretboardCommaPlayer, superClass);

    function FretboardCommaPlayer() {
      return FretboardCommaPlayer.__super__.constructor.apply(this, arguments);
    }

    FretboardCommaPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      FretboardCommaPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (!(current_tick % 24)) {
        return this.fbc.replace(this.chord);
      }
    };

    return FretboardCommaPlayer;

  })(CommaPlayer);

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

  patternMap = {
    up: function(current_tick) {
      return (current_tick + 12) % 24;
    },
    down: function(current_tick) {
      return current_tick % 24;
    },
    dotquarter: function(current_tick) {
      return current_tick % 36;
    },
    half: function(current_tick) {
      return current_tick % 48;
    },
    dothalf: function(current_tick) {
      return current_tick % 72;
    },
    whole: function(current_tick) {
      return current_tick % 96;
    },
    samba: function(current_tick) {
      return !([0, 18, 36, 60, 72].indexOf(current_tick % 96) > -1);
    },
    rhumba: function(current_tick) {
      return !([0, 18, 42, 60, 72].indexOf(current_tick % 96) > -1);
    }
  };

  ChordPlayer = (function(superClass) {
    extend(ChordPlayer, superClass);

    function ChordPlayer() {
      return ChordPlayer.__super__.constructor.apply(this, arguments);
    }

    ChordPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var high, low, notes, pattern, start, sustain, sustain_ticks, volume;
      ChordPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (this.off) {
        return;
      }
      if (this.options.volume === 0) {
        return;
      }
      pattern = this.options.pattern || 'up';
      if (patternMap[pattern](current_tick)) {
        return;
      }
      volume = this.options.volume || 30;
      volume += (this.options.random * (Math.random() - 0.5)) * volume * 2;
      sustain_ticks = this.options.sustain_ticks || 12;
      sustain = metronome.seconds_per_tick * sustain_ticks;
      sustain += this.options.random * (Math.random() - 0.5) * sustain * 2;
      low = this.options.low || 0;
      high = this.options.high || 100;
      start = time - metronome.audioContext.currentTime;
      notes = limit_notes(get_full_chord(this.chord), low, high);
      MIDI.chordOn(0, notes, volume, start);
      return MIDI.chordOff(0, notes, start + sustain);
    };

    return ChordPlayer;

  })(CommaPlayer);

  RandomArpPlayer = (function(superClass) {
    extend(RandomArpPlayer, superClass);

    function RandomArpPlayer() {
      return RandomArpPlayer.__super__.constructor.apply(this, arguments);
    }

    RandomArpPlayer.prototype.play = function(current_tick, time, tempo, metronome) {
      var high, low, notes, rand, random_ticks, start, sustain, sustain_ticks, tick_multiple, vol_factor, volume;
      RandomArpPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (this.off) {
        return;
      }
      tick_multiple = this.options.tick_multiple || 12;
      if (!binran(this.options.play_prob || 1)) {
        return;
      }
      vol_factor = 1;
      if (current_tick % tick_multiple) {
        if (current_tick % (tick_multiple / 2)) {
          return;
        }
        if (!binran(this.options.p_double)) {
          return;
        }
        vol_factor *= 0.125;
      }
      if (current_tick % (tick_multiple * 2)) {
        vol_factor *= 1.5;
      }
      if (this.options.volume === 0) {
        return;
      }
      volume = this.options.volume || 127;
      volume = volume * Math.random() * vol_factor;
      if (volume > 127) {
        volume = 127;
      }
      low = this.options.low || 0;
      high = this.options.high || 100;
      this.options.sustain_ticks = this.options.sustain_ticks || 6;
      random_ticks = this.options.sustain_ticks * this.options.sustain_random * Math.random();
      sustain_ticks = this.options.sustain_ticks;
      if (binran()) {
        sustain_ticks -= random_ticks;
      } else {
        sustain_ticks += random_ticks;
      }
      sustain = metronome.seconds_per_tick * sustain_ticks;
      start = time - metronome.audioContext.currentTime;
      notes = limit_notes(get_full_chord(this.chord), low, high);
      rand = notes[Math.floor(Math.random() * notes.length)];
      MIDI.noteOn(0, rand, volume, start);
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
      var ac, freq, gNode, gain, high, low, notes, osc, sustain;
      OscillatorPlayer.__super__.play.call(this, current_tick, time, tempo, metronome);
      if (this.off) {
        return;
      }
      if (current_tick % (this.options.tick_multiple || 6)) {
        return;
      }
      this.options.sustain = this.options.sustain || 2;
      sustain = this.options.sustain * metronome.seconds_per_tick;
      this.options.gain = this.options.gain || 0.2;
      gain = this.options.gain / 10;
      low = this.options.low || 20;
      high = this.options.high || 110;
      notes = limit_notes(get_full_chord(this.chord), low, high);
      if (!notes.length) {
        return;
      }
      ac = metronome.audioContext;
      freq = midi_to_freq(notes[Math.floor(Math.random() * notes.length)]);
      osc = ac.createOscillator();
      gNode = ac.createGain();
      osc.connect(gNode);
      gNode.gain.value = gain;
      gNode.connect(ac.destination);
      osc.frequency.value = freq;
      osc.start(time);
      return osc.stop(time + sustain);
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
    var DEFAULTS, normalize_scope, search, set_search;
    window.$location = $location;
    window.$scope = $scope;
    $scope.instruments = instruments;
    $scope.chords_pattern_choices = patternMap;
    DEFAULTS = {
      arp_high: 110,
      arp_low: 20,
      arp_on: true,
      arp_play_prob: 0.5,
      arp_p_double: 0.01,
      arp_sustain_ticks: "3",
      arp_sustain_random: 0.1,
      arp_tick_multiple: "6",
      arp_volume: "200",
      chords_high: 110,
      chords_low: 38,
      chords_on: true,
      chords_pattern: "rhumba",
      chords_sustain_ticks: "2",
      chords_volume: "48",
      chords_random: 0.1,
      comma_song: "C,,G dim7,,",
      instrument: "guitar",
      lookahead: "20",
      loop: true,
      oscillator_gain: "2.1",
      oscillator_high: 60,
      oscillator_low: 20,
      oscillator_on: true,
      oscillator_sustain: "2",
      oscillator_tick_multiple: "6",
      tempo: "95"
    };
    search = $location.search();
    Object.keys(DEFAULTS).forEach(function(k) {
      if (!search[k]) {
        return search[k] = DEFAULTS[k];
      }
    });
    search.comma_song = search.comma_song.replace(/\+/g, ' ');
    Object.keys(search).forEach(function(k) {
      if (search[k] === 'false') {
        return search[k] = false;
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
      search[key] = value || $scope[key];
      return $location.search(search);
    };
    normalize_scope = function() {
      $scope.chords_low = Number($scope.chords_low);
      $scope.chords_high = Number($scope.chords_high);
      $scope.arp_low = Number($scope.arp_low);
      $scope.arp_high = Number($scope.arp_high);
      $scope.oscillator_low = Number($scope.oscillator_low);
      return $scope.oscillator_high = Number($scope.oscillator_high);
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
      $scope.fbc.replace();
      search = $location.search();
      search.instrument = $scope.instrument;
      return $location.search(search);
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
    $scope.oscillator_on_change = function() {
      $scope.oscillator_player.off = !$scope.oscillator_on;
      return set_search('oscillator_on');
    };
    $scope.oscillator_gain_change = function() {
      $scope.oscillator_player.options.gain = Number($scope.oscillator_gain);
      return set_search('oscillator_gain');
    };
    $scope.oscillator_sustain_change = function() {
      $scope.oscillator_player.options.sustain = Number($scope.oscillator_sustain);
      return set_search('oscillator_sustain');
    };
    $scope.oscillator_low_change = function() {
      normalize_scope();
      if ($scope.oscillator_high <= $scope.oscillator_low) {
        $scope.oscillator_high = $scope.oscillator_low + 1;
      }
      $scope.oscillator_player.options.low = Number($scope.oscillator_low);
      return set_search('oscillator_low');
    };
    $scope.oscillator_high_change = function() {
      normalize_scope();
      if ($scope.oscillator_low >= $scope.oscillator_high) {
        $scope.oscillator_low = $scope.oscillator_high - 1;
      }
      $scope.oscillator_player.options.high = Number($scope.oscillator_high);
      return set_search('oscillator_high');
    };
    $scope.oscillator_tick_multiple_change = function() {
      $scope.oscillator_player.options.tick_multiple = Number($scope.oscillator_tick_multiple);
      return set_search('oscillator_tick_multiple');
    };
    $scope.chords_on_change = function() {
      $scope.chord_player.off = !$scope.chords_on;
      return set_search('chords_on');
    };
    $scope.chords_volume_change = function() {
      $scope.chord_player.options.volume = Number($scope.chords_volume);
      return set_search('chords_volume');
    };
    $scope.chords_sustain_ticks_change = function() {
      $scope.chord_player.options.sustain_ticks = Number($scope.chords_sustain_ticks);
      return set_search('chords_sustain_ticks');
    };
    $scope.chords_low_change = function() {
      normalize_scope();
      if ($scope.chords_high <= $scope.chords_low) {
        $scope.chords_high = $scope.chords_low + 1;
      }
      $scope.chord_player.options.low = Number($scope.chords_low);
      return set_search('chords_low');
    };
    $scope.chords_high_change = function() {
      normalize_scope();
      if ($scope.chords_low >= $scope.chords_high) {
        $scope.chords_low = $scope.chords_high - 1;
      }
      $scope.chord_player.options.high = Number($scope.chords_high);
      return set_search('chords_high');
    };
    $scope.chords_pattern_change = function() {
      $scope.chord_player.options.pattern = $scope.chords_pattern;
      return set_search('chords_pattern');
    };
    $scope.chords_random_change = function() {
      $scope.chord_player.options.random = $scope.chords_random;
      return set_search('chords_random');
    };
    $scope.arp_on_change = function() {
      $scope.arp_player.off = !$scope.arp_on;
      return set_search('arp_on');
    };
    $scope.arp_volume_change = function() {
      $scope.arp_player.options.volume = Number($scope.arp_volume);
      return set_search('arp_volume');
    };
    $scope.arp_sustain_ticks_change = function() {
      $scope.arp_player.options.sustain_ticks = Number($scope.arp_sustain_ticks);
      return set_search('arp_sustain_ticks');
    };
    $scope.arp_sustain_random_change = function() {
      $scope.arp_player.options.sustain_random = Number($scope.arp_sustain_random);
      return set_search('arp_sustain_random');
    };
    $scope.arp_low_change = function() {
      normalize_scope();
      if ($scope.arp_high <= $scope.arp_low) {
        $scope.arp_high = $scope.arp_low + 1;
      }
      $scope.arp_player.options.low = Number($scope.arp_low);
      return set_search('arp_low');
    };
    $scope.arp_high_change = function() {
      normalize_scope();
      if ($scope.arp_low >= $scope.arp_high) {
        $scope.arp_low = $scope.arp_high - 1;
      }
      $scope.arp_player.options.high = Number($scope.arp_high);
      return set_search('arp_high');
    };
    $scope.arp_tick_multiple_change = function() {
      $scope.arp_player.options.tick_multiple = Number($scope.arp_tick_multiple);
      return set_search('arp_tick_multiple');
    };
    $scope.arp_play_prob_change = function() {
      $scope.arp_player.options.play_prob = Number($scope.arp_play_prob);
      return set_search('arp_play_prob');
    };
    $scope.arp_p_double_change = function() {
      $scope.arp_player.options.p_double = Number($scope.arp_p_double);
      return set_search('arp_p_double');
    };
    $scope.init = function() {
      $scope.fb = new Fretboard($scope.instruments[$scope.instrument]);
      $scope.fbc = new FretboardCanvas("fretboard", $scope.fb);
      $scope.fbcp = new FretboardCommaPlayer($scope.comma_song, $scope.metronome, $scope.loop);
      $scope.fbcp.fbc = $scope.fbc;
      $scope.oscillator_player = new OscillatorPlayer($scope.comma_song, $scope.metronome, $scope);
      $scope.chord_player = new ChordPlayer($scope.comma_song, $scope.metronome, $scope);
      $scope.arp_player = new RandomArpPlayer($scope.comma_song, $scope.metronome, $scope);
      $scope.oscillator_on_change();
      $scope.oscillator_gain_change();
      $scope.oscillator_sustain_change();
      $scope.oscillator_low_change();
      $scope.oscillator_high_change();
      $scope.oscillator_tick_multiple_change();
      $scope.chords_on_change();
      $scope.chords_volume_change();
      $scope.chords_sustain_ticks_change();
      $scope.chords_low_change();
      $scope.chords_high_change();
      $scope.chords_pattern_change();
      $scope.chords_random_change();
      $scope.arp_on_change();
      $scope.arp_volume_change();
      $scope.arp_sustain_ticks_change();
      $scope.arp_sustain_random_change();
      $scope.arp_low_change();
      $scope.arp_high_change();
      $scope.arp_tick_multiple_change();
      $scope.arp_play_prob_change();
      $scope.arp_p_double_change();
      $scope.metronome.players = [$scope.fbcp, $scope.arp_player, $scope.chord_player, $scope.oscillator_player];
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
