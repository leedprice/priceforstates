 function print_country(country_id) {
    
     $("#country-icon").replaceWith("<i id=\"country-icon-dynamic\" class=\"fa fa-refresh fa-pulse\"></i>");
     $.getJSON('https://leedonline-api.usgbc.org/v1/Common/getCountriesAndStates.json', function (data) {
         var option_str = document.getElementById(country_id);
         option_str.innerHTML = "";
         option_str.length = 0;
         option_str.options[0] = new Option('--Select Country--', '');
         option_str.selectedIndex = 0;
         var countries = data.countries;
         var printCountries = Object.keys(countries);
         printCountries.forEach(function (key) {
             option_str.options[option_str.length] = new Option(countries[key], key);
         });
         $("#country-icon-dynamic").replaceWith("<i id=\"country-icon\" class=\"fa fa-globe\"></i>");
     });
 }
 $(document).ready(function () {
     
     var BDCIDC =  {
         rate: "Registration",
         designRate: "Design Review",
         constRate: "Construction Review"};
 
     var OM = {rate: "Registration" }
     
     $("#ratingSystem").change(function(){
        var select = $("#ratingSystem option:selected").val();
         switch (select) {
             case "BD+C" :
                 setTypeInDropDown(BDCIDC);
                 break;
             case "ID+C" :
                 setTypeInDropDown(BDCIDC);
                 break;
             case "O+M" :
                 setTypeInDropDown(OM);
                 break;
             default:
             $("#type").empty();
             $("#type").append("<option value=\"\">--Select Rate Type--</option>");    
               break;  
         }
     });
     
     $("#leedprice").submit(function () {
         
         var country = $("#country").val();
         var ratingSystem = $("#ratingSystem").val();
         var type = $('#type').val();
         var givenArea = $('#givenArea').val();

         //For safari and other browsers which does not support HTML5 validation
         var checkBrowser=safariFormValidation(this);
         if(checkBrowser === false){
             console.log(checkBrowser);
             return false;
         }
         console.log(checkBrowser);
        
       
         $("#submit-calculate").replaceWith("<button id=\"submit-dynamic\" class=\"btn btn-danger\" disabled><i class=\"fa fa-spinner fa-pulse\"></i> Calculating</button>");
      
         setDescrpition(givenArea, type, ratingSystem);
         $.getJSON('https://leedonline-api.usgbc.org/v1/Common/getPriceRelatedInfo.json?countryOrCurrency=' + country, function (infodata) {
           if(infodata.data.currency != undefined){
              var currency = infodata.data.currency;
              var curSymbol;
              if (currency == 'INR') {
                 curSymbol = "₹";
              }
              else if (currency == 'CAD') {
                 curSymbol = "$"
                 currency = 'USD'; //Taking by default USD
              }
              else {
                 curSymbol = "$";
              }
             callTogetVersionPricesInfo(infodata, curSymbol, currency, givenArea, type, ratingSystem);
            }
             else {
                 $("#modalerror").modal({backdrop: "static"});
                 $("#submit-dynamic").replaceWith("<button id=\"submit-calculate\" class=\"btn btn-primary\" type=\"submit\" name=\"submit\"><i class=\"fa fa-calculator\"></i> Calculate</button>");
             }
         });
     });
     $(".modal-close").click(function () {
         $('#tablebody').empty();
         $('#pArea').empty();
         $('#pRating').empty();
         $('#pType').empty();
     });
 });

 function setTypeInDropDown(rateType){
    
    $("#type").empty();
    $("#type").append("<option value=\"\">--Select Rate Type--</option>");
     
    Object.keys(rateType).forEach(function(key) { 
    $("#type").append("<option value=\"" + key + "\">" + rateType[key] + "</option>")
  });
     
 }

 function callTogetVersionPricesInfo(infodata, curSymbol, currency, givenArea, type, ratingSystem) {
     
     $.getJSON('https://leedonline-api.usgbc.org/v1/LEEDPricing/getVersionPricesInfo.json?versionOrCurrency=' + currency + '&ratingSystem=' + ratingSystem + '&area=' + givenArea + '&calculate=' + type, function (pricedata) {
         if (pricedata.payableInfo != undefined) {
             createTotalPriceTable(infodata, pricedata, curSymbol);
             createTaxTable(infodata, pricedata, curSymbol);
             createGrandTotal(infodata, pricedata, curSymbol);
             $("#modalpopup").modal({backdrop: "static"});
         }
         else {
             $("#modalerror").modal({backdrop: "static"});
         }
         $("#submit-dynamic").replaceWith("<button id=\"submit-calculate\" class=\"btn btn-primary\" type=\"submit\" name=\"submit\"><i class=\"fa fa-calculator\"></i> Calculate</button>");
     });
 }

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
         var td2 = document.createElement("td");
         var td3 = document.createElement("td");
         tdrow.setAttribute("class", "text-center");
         var textnode = document.createTextNode("Taxes");
         tdrow.appendChild(textnode);
         taxrow.appendChild(tdrow);
         taxrow.appendChild(td2);
         taxrow.appendChild(td3);
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

 function setDescrpition(givenArea, type, ratingSystem) {
     
     var typeMap = {
         rate: "Registration",
         designRate: "Design Review",
         constRate: "Construction Review"
     };
     var rSystem = {
         "BD+C": "Building Design and Construction (BD+C)", 
         "ID+C": "Interior Design and Construction (ID+C)",
         "O+M": "Building Operations and Maintenance (O+M)"
     };
     var textnode = document.createTextNode(givenArea + " sq ft");
     document.getElementById("pArea").appendChild(textnode);
     textnode = document.createTextNode(rSystem[ratingSystem]);
     document.getElementById("pRating").appendChild(textnode);
     textnode = document.createTextNode(typeMap[type]);
     document.getElementById("pType").appendChild(textnode);
 }

 // Custom message validation Function 

 function checkValidationInput(obj, param) {
     var setMessage = {
         "country": "Please select country in the list.",
         "ratingSystem": "Please select Rating System in the list.",
         "type": "Select Project Type.",
         "givenArea": "Please enter area in sq ft."
     };
     switch (param) {
         case "country":
             obj.setCustomValidity(setMessage[param]);
             break;
         case "ratingSystem":
             obj.setCustomValidity(setMessage[param]);
             break;
         case "type":
             obj.setCustomValidity(setMessage[param]);
             break;
         case "givenArea":
             obj.setCustomValidity(setMessage[param]);
             break;
         default:
             return;
             break;
     }
 }

 function verifyValidInput(obj, param) {

     try {
         switch (param) {
             case "country":
                 obj.setCustomValidity('');
                 break;
             case "ratingSystem":
                 obj.setCustomValidity('');
                 break;
             case "type":
                 obj.setCustomValidity('');
                 break;
             case "givenArea":
                 obj.setCustomValidity('');
                 break;
             default:
                 return;
                 break;

         }
     } catch (e) {
         console.log(e);
        }
 }

 //Validation for safari and other Non HTML5 form validation 
 function safariFormValidation(obj){

     if (!obj.checkValidity()) {  //checkValidity not available in NonHTNL5
        var valid = true;

         $('.required').each(function() {
            if (this.value == '') {
              alert("Error, Data field is required.");      
               valid = false;
               this.focus();
               return false; }
          });
          
         if(valid === false){
            return false;}
         else{ return true; }
      }
    else { return true;   }
 }

 function printData() {

     var headToPrint = document.getElementById("head4");
     var p1ToPrint = document.getElementById("pDesc1");
     var p2ToPrint = document.getElementById("pDesc2");
     var p3ToPrint = document.getElementById("pDesc3");
     var divToPrint = document.getElementById("datatable");
     var htmlToPrint = '' +
         '<style type="text/css">' +
         'table {' +
         'border:solid #000 !important;' +
         'border-width:1px 0 0 1px !important;' +
         '}' + 'th, td {' +
         'padding:12px !important;' +
         'border:solid #000 !important;' +
         'border-width:0 1px 1px 0 !important;' +
         'font-size:20px !important;' +
         '}' +
         '#head4 {' +
         'font-size:20px !important;' +
         '}' +
         '</style>';
     htmlToPrint += divToPrint.outerHTML;
     newWin = window.open("");
     newWin.document.write(headToPrint.outerHTML);
     newWin.document.write(p1ToPrint.outerHTML);
     newWin.document.write(p2ToPrint.outerHTML);
     newWin.document.write(p3ToPrint.outerHTML);
     newWin.document.write(htmlToPrint);
     newWin.print();
     newWin.close();
 }

 function resetFormData() {
     $("#leedprice").trigger("reset");
 }