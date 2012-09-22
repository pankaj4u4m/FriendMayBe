(function ($) {
  function UserLocation() {
    var resource;
    var status = null;
    var _successFunction = function (position) {
      console.log("got user location");
      var latitude = position.coords.latitude;
      var longitude = position.coords.longitude;
      var token = $('meta[name=csrf-token]').attr('content');
      var param = $('meta[name=csrf-param]').attr('content');
      var data = {latitude:latitude, longitude:longitude, resource:resource};
      data[param] = token;
      $.ajax({
        type:'post',
        url:Constants.USER_LOCATION,
        dataType:'json',
        tryCount:0,
        retryLimit:3,
        data:data,
        success:function (data) {
          status = data.status;
        },
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
    };
    var _errorFunction = function (position) {
      console.log('not able to get you location');
      console.log(position);
    };
    this.setUserLocation = function (res) {
      if (status) return;

      resource = res;
      //Check if browser supports W3C Geolocation API
      if (navigator.geolocation) {
//        console.log('getting location');
        navigator.geolocation.getCurrentPosition(_successFunction, _errorFunction);
      } else {
        console.log('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
      }

    };
  }
  var _INSTANCE = new UserLocation();
  $.getUserLocation = function () {
    return _INSTANCE;
  };
})(jQuery);