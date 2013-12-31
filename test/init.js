(function () {
  var instance;

  module("initialization", {
    setup: function () {
      instance = new Rotation();
    }
  });

  test("constructor", function () {
    var element = $(".rotation-container"),
    rotation = new Rotation(element);
    equal(rotation.itemsCount(), 2, "equal items");
  });

  test("current", function () {
    var element = $(".rotation-container"),
    rotation = new Rotation(element);
    equal(rotation.current(), 0, "0 index");
  });
})();
