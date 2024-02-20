var chart = {
  // Canvas and context for drawing the chart
  canvas: null,
  context: null,

  // Pixel ratio for high-resolution displays
  pixel: {
    ratio: window.devicePixelRatio > 1 ? 2 : 1,
  },

  // Size of the chart canvas
  size: {
    width: 400,
    height: 72,
  },

  // Metrics for chart drawing
  metrics: {
    // X and Y transforms
    a: 40,
    b: 20,

    // Font size, spacing, and position
    c: 12,
    d: 12,
    e: 32,
    f: 10,
    g: 3,
    h: 300,
    i: 270,
    j: 38,

    // Line weight and colors
    k: 1,
    l: "#ffffff", // line color
    m: "#e17540", // theme color

    // Offset top
    n: 0,
  },

  // Prepares the canvas for drawing the chart
  prepare: function (eq) {
    // Get the canvas element
    chart.canvas = document.getElementById("chart");
    chart.canvas.width = chart.pixel.ratio * chart.size.width;
    chart.canvas.height = chart.pixel.ratio * chart.size.height;

    // Get the canvas context for drawing
    chart.context = chart.canvas.getContext("2d");

    // Set up transformations for drawing
    chart.context.translate(
      chart.pixel.ratio * chart.metrics.a,
      chart.pixel.ratio * chart.metrics.d
    );

    // Draw horizontal line
    chart.context.beginPath();
    chart.context.moveTo(
      chart.pixel.ratio * chart.metrics.d,
      chart.pixel.ratio * chart.metrics.b
    );
    chart.context.lineTo(
      chart.pixel.ratio * chart.metrics.h,
      chart.pixel.ratio * chart.metrics.b
    );
    chart.context.lineWidth = chart.pixel.ratio * chart.metrics.k;
    chart.context.strokeStyle = chart.metrics.l;
    chart.context.stroke();
    chart.context.beginPath();

    // Draw vertical lines for each EQ band
    for (let i = 0; i < eq.length - 1; i++) {
      chart.context.moveTo(
        chart.pixel.ratio * (i * chart.metrics.e + chart.metrics.d),
        chart.pixel.ratio * chart.metrics.n
      );
      chart.context.lineTo(
        chart.pixel.ratio * (i * chart.metrics.e + chart.metrics.d),
        chart.pixel.ratio * chart.metrics.a
      );
    }
    chart.context.stroke();
    chart.context.beginPath();
    chart.context.stroke();

    // Set up font and draw dB labels
    chart.context.fillStyle = chart.metrics.l;
    chart.context.strokeStyle = chart.metrics.l;
    chart.context.lineWidth = chart.pixel.ratio * chart.metrics.k;
    chart.context.font = chart.pixel.ratio * chart.metrics.c + "px monospace";
    chart.context.textAlign = "right";
    chart.context.fillText(
      "+" + chart.metrics.d + " db",
      chart.pixel.ratio * (chart.metrics.a - chart.metrics.j),
      chart.pixel.ratio * (chart.metrics.f + chart.metrics.g) - chart.metrics.c
    );
    chart.context.fillText(
      "-" + chart.metrics.d + " db",
      chart.pixel.ratio * (chart.metrics.a - chart.metrics.j),
      chart.pixel.ratio * (chart.metrics.a - chart.metrics.g) + chart.metrics.c
    );
    chart.context.textAlign = "left";
    chart.context.fillText(
      "+" + chart.metrics.d + " db",
      chart.pixel.ratio * (chart.metrics.a + chart.metrics.i),
      chart.pixel.ratio * (chart.metrics.f + chart.metrics.g) - chart.metrics.c
    );
    chart.context.fillText(
      "-" + chart.metrics.d + " db",
      chart.pixel.ratio * (chart.metrics.a + chart.metrics.i),
      chart.pixel.ratio * (chart.metrics.a - chart.metrics.g) + chart.metrics.c
    );
    chart.context.closePath();

    // Draw initial chart based on equalizer settings
    chart.refresh(eq);
  },

  // Draws or refreshes the chart based on the provided equalizer settings
  refresh: function (eq) {
    // Array to store points for drawing the curve
    let points = [];

    // Calculate points for the curve
    for (let i = 1; i < eq.length; i++) {
      points.push({
        xy: 0,
        xc: 0,
        x: (i - 1) * chart.metrics.e + chart.metrics.d,
        y: chart.metrics.b - (chart.metrics.b / chart.metrics.d) * eq[i].gain,
      });
    }

    // Begin drawing the curve
    chart.context.beginPath();
    chart.context.moveTo(
      chart.pixel.ratio * points[0].x,
      chart.pixel.ratio * points[0].y
    );

    // Draw the curve using quadratic Bezier segments
    for (let i = 1; i < points.length - 2; i++) {
      let xc = (points[i].x + points[i + 1].x) / 2;
      let yc = (points[i].y + points[i + 1].y) / 2;
      chart.context.quadraticCurveTo(
        chart.pixel.ratio * points[i].x,
        chart.pixel.ratio * points[i].y,
        chart.pixel.ratio * xc,
        chart.pixel.ratio * yc
      );
    }

    // Draw the last segment of the curve
    let i = points.length - 2;
    chart.context.quadraticCurveTo(
      chart.pixel.ratio * points[i].x,
      chart.pixel.ratio * points[i].y,
      chart.pixel.ratio * points[i + 1].x,
      chart.pixel.ratio * points[i + 1].y
    );

    // Set line style and stroke the curve
    chart.context.lineWidth = chart.pixel.ratio * chart.metrics.k;
    chart.context.strokeStyle = chart.metrics.m;
    chart.context.stroke();

    // Create gradient for filling the area under the curve
    let gradient = chart.context.createLinearGradient(
      chart.pixel.ratio * 0,
      chart.pixel.ratio * 0,
      chart.pixel.ratio * 0,
      chart.pixel.ratio * chart.metrics.a
    );
    gradient.addColorStop(0.0, chart.metrics.m);
    gradient.addColorStop(0.5, chart.metrics.m);
    gradient.addColorStop(1.0, chart.metrics.m);

    // Draw the filled area under the curve
    points = [];
    for (let i = 1; i < eq.length; i++) {
      points.push({
        xc: 0,
        xy: 0,
        x: (i - 1) * chart.metrics.e + chart.metrics.d,
        y: chart.metrics.b - (chart.metrics.b / chart.metrics.d) * eq[i].gain,
      });
    }

    chart.context.beginPath();
    chart.context.moveTo(
      chart.pixel.ratio * chart.metrics.d,
      chart.pixel.ratio * chart.metrics.b
    );
    chart.context.lineTo(
      chart.pixel.ratio * points[0].x,
      chart.pixel.ratio * points[0].y
    );

    for (let i = 1; i < points.length - 2; i++) {
      let xc = (points[i].x + points[i + 1].x) / 2;
      let yc = (points[i].y + points[i + 1].y) / 2;
      chart.context.quadraticCurveTo(
        chart.pixel.ratio * points[i].x,
        chart.pixel.ratio * points[i].y,
        chart.pixel.ratio * xc,
        chart.pixel.ratio * yc
      );
    }

    chart.context.quadraticCurveTo(
      chart.pixel.ratio * points[i].x,
      chart.pixel.ratio * points[i].y,
      chart.pixel.ratio * points[i + 1].x,
      chart.pixel.ratio * points[i + 1].y
    );
    chart.context.lineTo(
      chart.pixel.ratio * chart.metrics.h,
      chart.pixel.ratio * chart.metrics.b
    );
    chart.context.closePath();
    chart.context.fillStyle = gradient;
    chart.context.fill();
  },
};
