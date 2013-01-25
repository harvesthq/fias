$.fn.message = -> $("##{$(@).data("message-id")}")

fixValue = (dial, value) ->
  if (value < dial.o.min)
    dial.o.min
  else if (value > dial.o.max)
    dial.o.max
  else
    value

class FIASCalculator
  constructor: ->
    $("[data-dial]").knob
      min: 1,
      max: 10,
      fgColor: "#468847",
      angleOffset: "-125",
      angleArc: "250",
      thickness: "0.3",
      change: @changed
      draw: @updateFinalScore

    $("#final-score").knob
      min: 3,
      max: 30,
      fgColor: "#C09853",
      thickness: 0.5,
      width: 300,
      height: 400
      readOnly: true

    @parseURL()

    changed = @changed
    $("[data-dial]").each ->
      changed.call($(@).data("knob"), $(@).val())

    @setupCopyButton()

  changed: (value) ->
    value = fixValue(@, value)
    $input = $(@.i)
    $message = $input.message()
    score = new Score($input.data("dial"), value)

    $message.html(score.message)
    $message.removeClass(score.cssClasses().join(" "))
    $message.addClass(score.css)
    $input.trigger("configure", {fgColor:score.color})

  updateFinalScore: ->
    values = $("[data-dial]").map((_, dial) ->
      parseInt($(dial).val())
    ).toArray()
    knob = $("#final-score").data("knob")

    if knob
      score = new FinalScore(values)
      knob.val(score.total)
      knob.$.trigger("configure", {fgColor:score.color})
      $message = knob.$.message()
      $message.html(score.message())
      score.updateURL()

  parseURL: ->
    if window.location.search
      values = [
        @getParameterByName("v1"),
        @getParameterByName("v2"),
        @getParameterByName("v3")
      ]
      $("[data-dial]").each (i, elem) ->
        $(elem).data("knob").val(values[i])

  # Stolen shamelessly from http://stackoverflow.com/a/901144/410759
  getParameterByName: (name) ->
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
    regexS = "[\\?&]" + name + "=([^&#]*)"
    regex = new RegExp(regexS)
    results = regex.exec(window.location.search)
    if(results == null)
      return ""
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "))

  setupCopyButton: ->
    ZeroClipboard.setMoviePath('js/ZeroClipboard10.swf')
    clip = new ZeroClipboard.Client()
    clip.glue("final-copy-btn", "final-copy-btn-div")
    clip.addEventListener("mouseDown", (client) ->
      client.setText($("#final-message").val())
    )
    clip.addEventListener("complete", ->
      btn = $("#final-copy-btn")
      btn.data("old-html", btn.html())
      btn.html("Copied!")
      setTimeout(() ->
        btn.html(btn.data("old-html"))
      , 2000)
    )

class Score
  messages = [
    [
      "Equivalent to a single partial",
        "A small handful of views",
        "It's everywhere, like the plague",
    ]
    [
      "Nothing - it's straight forward",
      "I understand what it's doing, but I'm not 100% sure about parts",
      "It's freaking greek",
    ]
    [
      "Dude, it's a copy change",
      "I could see some potential for problems, but they seem unlikely to have humongous impact",
      "I can imagine about 400 ways this blows up",
    ]
  ]

  constructor: (type, value) ->
    index = if value <= 3 then 0
    else if value >= 4 && value <= 6 then 1
    else 2

    @type    = type
    @value   = value
    @index   = index
    @message = messages[@type][@index]

    @scoreColor = new ScoreColor(@index)
    @css        = @scoreColor.css
    @color      = @scoreColor.color

  cssClasses: -> @scoreColor.cssClasses()

class ScoreColor
  colors = [
    {css:"alert-success", color:"#468847"}
    {css:"alert-warning", color:"#C09853"}
    {css:"alert-error",   color:"#B94A48"}
  ]

  constructor: (index) ->
    @css     = colors[index].css
    @color   = colors[index].color

  cssClasses: -> colors.map (color) -> color.css

class FinalScore
  constructor: (values) ->
    @values = values
    @total = values.reduce((sum, v) ->
      sum + v
    , 0)

    index = if @total <= 14 then 0
    else if @total >= 15 && @total <= 19 then 1
    else 2

    @scoreColor = new ScoreColor(index)
    @css        = @scoreColor.css
    @color      = @scoreColor.color

  cssClasses: -> @scoreColor.cssClasses()

  message: ->
    "[FIAS: #{@values.join(" / ")} = #{@total}](#{window.location.origin}#{@queryString()})"

  queryString: -> "?#{$.param(v1:@values[0], v2:@values[1], v3:@values[2])}"

  updateURL: ->
    window.history.replaceState(null, null, @queryString())

window.FIASCalculator = FIASCalculator
