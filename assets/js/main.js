  function print_country(country_id) {
      $("#country-icon").replaceWith("<i id=\"country-icon-dynamic\" class=\"fa fa-refresh fa-pulse\"></i>");
      $.getJSON('https://leedonline-api.usgbc.org/v1/Common/getCountriesAndStates.json', function (data) {
          var option_str = document.getElementById(country_id);
          option_str.length = 0;
          option_str.options[0] = new Option('Select Country', '');
          option_str.selectedIndex = 0;
          var countries = data.countries;
          var printCountries = Object.keys(countries);
          printCountries.forEach(function (key) {
              option_str.options[option_str.length] = new Option(countries[key], key);
          });
          $("#country-icon-dynamic").replaceWith("<i id=\"country-icon\" class=\"fa fa-globe\"></i>");
      });
  }

  function print_state(state_id, country_index) {
      $("#country-icon").replaceWith("<i id=\"country-icon-dynamic\" class=\"fa fa-refresh fa-pulse\"></i>");
      $.getJSON('https://leedonline-api.usgbc.org/v1/Common/getCountriesAndStates.json', function (data) {
          var option_str = document.getElementById(state_id);
          option_str.length = 0;
          option_str.options[0] = new Option('Select State', '');
          option_str.selectedIndex = 0;
          if (data.divisions[country_index] != undefined) {
              $("#state-option").removeClass("hidden").addClass("visible");
              $('#state').prop('required', true);
              var states = data.divisions[country_index];
              var printStates = Object.keys(states);
              printStates.forEach(function (key) {
                  option_str.options[option_str.length] = new Option(states[key], key);
              });
          }
          else {
              $("#state-option").removeClass("visible").addClass("hidden");
              $("#state").removeAttr("required");
          }
          $("#country-icon-dynamic").replaceWith("<i id=\"country-icon\" class=\"fa fa-globe\"></i>");
      });
  }
  $(document).ready(function () {
      $("#leedprice").submit(function () {
          $("#submit-calculate").replaceWith("<button id=\"submit-dynamic\" class=\"btn btn-danger\"><i class=\"fa fa-spinner fa-pulse\"></i> Calculating</button>");
          var country = $("#country").val();
          var state = $("#state").val();
          var ratingSystem = $("#ratingSystem").val();
          var type = $('#type').val();
          var givenArea = $('#givenArea').val();
          
          $.getJSON('https://leedonline-api.usgbc.org/v1/Common/getPriceRelatedInfo.json?countryOrCurrency=' + country, function (infodata) {
              var currency = infodata.data.currency;
              var curSymbol;
              if (currency == 'INR') {
                  curSymbol = "Rs.";
              }
              else if (currency == 'CAD') {
                  curSymbol = "C$"
                  currency = 'USD'; //by default US
              }
              else {
                  curSymbol = "$";
              }
              $.getJSON('https://leedonline-api.usgbc.org/v1/LEEDPricing/getVersionPricesInfo.json?versionOrCurrency=' + currency + '&ratingSystem=' + ratingSystem + '&area=' + givenArea + '&calculate=' + type, function (pricedata) {
                  if (pricedata.payableInfo != undefined) {
                      createTotalPriceTable(infodata, pricedata, curSymbol);
                      createTaxTable(infodata, pricedata, curSymbol);
                      createGrandTotal(infodata, pricedata, curSymbol);
                      $("#modalpopup").modal({ backdrop: "static"});
                  }
                  else {
                      $("#modalerror").modal({ backdrop: "static"});
                  }
                  $("#submit-dynamic").replaceWith("<button id=\"submit-calculate\" class=\"btn btn-primary\" type=\"submit\" name=\"submit\"><i class=\"fa fa-calculator\"></i> Calculate</button>");
              });
          });
      });
      $(".modal-close").click(function () {
          $('#tablebody').empty();
          $("#leedprice").trigger("reset");
      });
  });

  function createTotalPriceTable(infodata, pricedata, curSymbol) {
      var member = pricedata.payableInfo.member;
      var nonMember = pricedata.payableInfo.nonMember;
      var trow = document.createElement("tr");
      var tdrow = document.createElement("th");
      var textnode = document.createTextNode("Total");
      tdrow.appendChild(textnode);
      trow.appendChild(tdrow);
      tdrow = document.createElement("td");
      tdrow.setAttribute("class", "text-right");
      textnode = document.createTextNode(curSymbol + ' ' + member.total);
      tdrow.appendChild(textnode);
      trow.appendChild(tdrow);
      tdrow = document.createElement("td");
      tdrow.setAttribute("class", "text-right");
      textnode = document.createTextNode(curSymbol + ' ' + nonMember.total);
      tdrow.appendChild(textnode);
      trow.appendChild(tdrow);
      document.getElementById("tablebody").appendChild(trow);
  }

  function createTaxTable(infodata, pricedata, curSymbol) {
      var taxCodes = infodata.data.taxCodes;
      var member = pricedata.payableInfo.member;
      var nonMember = pricedata.payableInfo.nonMember;
      var memTaxObjSize = Object.keys(member.taxes.all.taxes).length;
      if (memTaxObjSize > 0 && memTaxObjSize != "undefined") {
          var taxrow = document.createElement("tr");
          var tdrow = document.createElement("th");
          tdrow.setAttribute("class", "text-center");
          var textnode = document.createTextNode("Taxes");
          tdrow.appendChild(textnode);
          taxrow.appendChild(tdrow);
          document.getElementById("tablebody").appendChild(taxrow);
          var taxes = Object.keys(member.taxes.all.taxes);
          taxes.forEach(function (key) {
              var taxrow = document.createElement("tr");
              var tdrow = document.createElement("td");
              tdrow.setAttribute("class", "text-center");
              var textnode = document.createTextNode(taxCodes[key]);
              tdrow.appendChild(textnode);
              taxrow.appendChild(tdrow);
              tdrow = document.createElement("td");
              tdrow.setAttribute("class", "text-right");
              textnode = document.createTextNode(curSymbol + ' ' + member.taxes.all.taxes[key]);
              tdrow.appendChild(textnode);
              taxrow.appendChild(tdrow);
              tdrow = document.createElement("td");
              tdrow.setAttribute("class", "text-right");
              textnode = document.createTextNode(curSymbol + ' ' + nonMember.taxes.all.taxes[key]);
              tdrow.appendChild(textnode);
              taxrow.appendChild(tdrow);
              document.getElementById("tablebody").appendChild(taxrow);
          });
      }
  }

  function createGrandTotal(infodata, pricedata, curSymbol) {
      var member = pricedata.payableInfo.member;
      var nonMember = pricedata.payableInfo.nonMember;
      var grandTotalrow = document.createElement("tr");
      var tdrow = document.createElement("th");
      var textnode = document.createTextNode("Grand Total");
      tdrow.appendChild(textnode);
      grandTotalrow.appendChild(tdrow);
      tdrow = document.createElement("th");
      tdrow.setAttribute("class", "text-right");
      textnode = document.createTextNode(curSymbol + ' ' + member.taxes.all.grandTotal);
      tdrow.appendChild(textnode);
      grandTotalrow.appendChild(tdrow);
      tdrow = document.createElement("th");
      tdrow.setAttribute("class", "text-right");
      textnode = document.createTextNode(curSymbol + ' ' + nonMember.taxes.all.grandTotal);
      tdrow.appendChild(textnode);
      grandTotalrow.appendChild(tdrow);
      document.getElementById("tablebody").appendChild(grandTotalrow);
  }