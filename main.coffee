console.log "foobar!"


class Fretboard

    constructor: (@strings) ->


main = () ->
    # ukelele
    strings = [7, 0, 4, 9]
    fb = Fretboard(strings)
    console.log fb

window.onload = main
