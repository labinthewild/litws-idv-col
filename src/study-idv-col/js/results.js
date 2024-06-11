(function (exports) {
    const PAGE_CONTENT_WIDTH = document.getElementById('content').offsetWidth + 100;
    const MAX_GRAPH_WIDTH = 900;
    const MAX_GRAPH_HEIGHT = 300;
    const MAX_SCORE = 30;
    const offset = 3;

    const width = Math.min(PAGE_CONTENT_WIDTH, MAX_GRAPH_WIDTH);
    const svgWidth = width + 45;
    const height = MAX_GRAPH_HEIGHT;
    const barHeight = height / 7.5;
    const halfWidth = width / 2;
    let svg = null;
    const colors1 = ['rgb(0,80,27)', 'rgb(204,236,230)'];
    const colors2 = ['rgb(253,212,158)', 'rgb(239,101,72)'];

    const _calculateMarkX = function (score) {
      if (score > MAX_SCORE - offset) {
        return (width / MAX_SCORE) * score - offset;
      }
      return (width / MAX_SCORE) * score;
    };

    const _addMark = function (context) {
      context.moveTo(barHeight / 2, barHeight);
      context.lineTo(0, 0);
      context.lineTo(barHeight, 0);
      context.closePath();
      return context;
    };

    const drawMark = function (score, legend, fill = false) {
      const mark = svg.append("g");
      const fill_color = fill ? "black" : "none";
      mark.append("path")
        .style("stroke", "black")
        .style("fill", fill_color)
        .attr('d', _addMark(d3.path()));

      mark.append("text")
        .attr('x', barHeight / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.5em')
        .text(legend);

      mark.attr('transform', `translate(${_calculateMarkX(score)}, ${height / 2 - (3 / 2 * barHeight)})`);
    };

    const draw = function (divID) {
      svg = d3.select(`#${divID}`)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", height);

      const grad1 = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad1')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      grad1.selectAll('stop')
        .data(colors1)
        .enter()
        .append('stop')
        .style('stop-color', function (d) { return d; })
        .attr('offset', function (d, i) {
          return 100 * (i / (colors1.length - 1)) + '%';
        });

      const grad2 = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad2')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      grad2.selectAll('stop')
        .data(colors2)
        .enter()
        .append('stop')
        .style('stop-color', function (d) { return d; })
        .attr('offset', function (d, i) {
          return 100 * (i / (colors2.length - 1)) + '%';
        });

      const bar1 = svg.append("g");
      bar1.append("rect")
        .attr('x', 20)
        .attr('y', 0)
        .attr('width', halfWidth)
        .attr('height', barHeight)
        .attr('fill', 'url(#grad1)');

      const bar2 = svg.append("g");
      bar2.append("rect")
        .attr('x', halfWidth + 20)
        .attr('y', 0)
        .attr('width', halfWidth)
        .attr('height', barHeight)
        .attr('fill', 'url(#grad2)');

      bar1.append("text")
        .attr('x', 0)
        .attr('y', barHeight * 2)
        .text($.i18n('study-idv-col-results-graphic-legend-1'));

      bar2.append("text")
        .attr('x', width)
        .attr('y', barHeight * 2)
        .attr('text-anchor', 'end')
        .text($.i18n('study-idv-col-results-graphic-legend-2'));

      bar1.attr('transform', `translate(0, ${height / 2 - (barHeight / 2)})`);
      bar2.attr('transform', `translate(0, ${height / 2 - (barHeight / 2)})`);
    };

    exports.results = {};
    exports.results.drawGraphic = draw;
    exports.results.drawMark = drawMark;

  })(window.LITW = window.LITW || {});
