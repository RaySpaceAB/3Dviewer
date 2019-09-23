var sprintf=require("sprintf-js").sprintf;

describe('3dviewer ready', function() {
  browser.get('http://localhost/3dviewer');
  it('should check if controller is accessible', function() {
    

    element(by.id('modelMenu')).evaluate('$ctrl').then(function(value) {
        console.log("value.homeURL: ", value.homeURL);
        expect(value).toBeDefined();
    });

    element.all(by.repeater('language in $ctrl.languages')).count().then(function(count) {
      console.log("Count: ", count);
    });
    var languages = element.all(by.repeater('language in $ctrl.languages'));
    expect(languages.count()).toEqual(4);
  });
  it('should check if viewer is ready', function() {
    //browser.get('http://localhost/3dviewer');

    var EC = protractor.ExpectedConditions;

    var el = element(by.css('.loading'));
    return browser.wait(EC.not(EC.presenceOf(el)));
  });
});