var options = {
    series: [76, 67, 61, 90],
    chart: {
    height: 390,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '30%',
        background: 'transparent',
        image: undefined,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          show: false,
        }
      },
      barLabels: {
        enabled: true,
        useSeriesColors: true,
        offsetX: -8,
        fontSize: '16px',
        formatter: function(seriesName, opts) {
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
        },
      },
    }
  },
  colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
  labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
          show: false
      }
    }
  }]
  };

  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
  var options = {
    series: [44, 55, 41, 17, 15],
    labels: ['Apples', 'Bananas', 'Cherries', 'Dates', 'Elderberries'],
    chart: {
      type: 'donut'
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      enabled: true
    },
    plotOptions: {
      pie: {
        donut: {
          size: '50%' // Decrease this value for wider bars (e.g., '45%', '40%')
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          show: false
        }
      }
    }]
  };
  var chart = new ApexCharts(document.querySelector("#donut"), options);
  chart.render();


  var options = {
    series: [
      {
        name: "Funnel Series",
        data: [1380, 1100, 990],
      },
    ],
    chart: {
      type: 'bar',
      height: 200,
      dropShadow: {
        enabled: true,
      },
      toolbar: {
        show: false  // Hides the burger icon / toolbar
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        barHeight: '40%',
        isFunnel: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
      },
      dropShadow: {
        enabled: true,
      },
    },
    title: {
      text: '', // Set title to empty to hide it
    },
    xaxis: {
      categories: [
        'Sourced',
        'Screened',
        'Assessed',
      ],
    },
    legend: {
      show: false,
    },
  };
  var chart = new ApexCharts(document.querySelector("#funnel"), options);
  chart.render();



  // Render chart
 
  
  var options = {
    series: [44, 55, 13, 43, 22],
    chart: {
      width: 400,
      type: 'pie',
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      formatter: function(seriesName, opts) {
        return seriesName; // remove percentage from legend
      }
    },
    dataLabels: {
      enabled: false // hide percentage by default
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return val + "%"; // show percentage on hover
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 20
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };
  
  var chart = new ApexCharts(document.querySelector("#radial"), options);




  chart.render();
  var options = {
    series: [{
      data: [400, 430, 448]
    }],
    chart: {
      type: 'bar',
      height: 200,
      toolbar: {
        show: false
      }
    },
    colors: ['tomato'], // ✅ Change this to your desired bar color
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: 'end',
        horizontal: true,
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['today', 'tomorrow', 'yesterday'],
    }
  };
  
  var chart = new ApexCharts(document.querySelector("#bar"), options);
  chart.render();
  
  
  


    