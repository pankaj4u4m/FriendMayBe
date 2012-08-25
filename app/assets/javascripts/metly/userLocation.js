(function ($) {
  var resource;
  $.getUserLocation = function (res) {
    resource = res
    //Check if browser supports W3C Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
    } else {
      console.log('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
    }
  }
  function successFunction(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var token = $('meta[name=csrf-token]').attr('content');
    var param = $('meta[name=csrf-param]').attr('content');
    var data = {latitude: lat, longitude: long, resource: resource};
    data[param] = token;
    $.ajax({
      type:'post',
      url:Constants.USER_LOCATION,
      dataType:'json',
      tryCount:0,
      retryLimit:3,
      data:data,
      error:function (xhr, textStatus, errorThrown) {
        if (textStatus == 'timeout') {
          this.tryCount++;
          if (this.tryCount <= this.retryLimit) {
            //try again
            $.ajax(this);
            return;
          }
          return;
        }
        if (xhr.status == 404) {
          //handle error
        } else {
          //handle error
        }

      }
    })
  }
  function errorFunction(position) {
    console.log('Error!');
  }
})(jQuery)