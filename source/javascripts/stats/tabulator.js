

var apiUrl = "http://localhost:8065/"

var ajaxConfig = {
  method:"get", 
  cache: "force-cache"
 };

function displayProviders(task) {
  table.setData(apiUrl+"providers/totals",{}, ajaxConfig);
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'providers',
    eventLabel: 'allproviders'
  });  
}

function displayClients(task) {
  table.setData(apiUrl+"clients/totals",{}, ajaxConfig);
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'clients',
    eventLabel: 'allclients'
  });  
}

function displayPrefixes(task) {
  table.setData(apiUrl+"prefixes/totals",{}, ajaxConfig);
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'prefixes',
    eventLabel: 'allprefixes'
  });  
}

function FindTaskById(task) {

  if (task.id === this[0]) {
      return task;
  }
}

function goToClients(cell) {
  console.log(cell);
  var provider = cell.originalTarget.textContent.toLowerCase();
  table.setData(apiUrl+"clients/totals?provider-id=" + provider,{}, ajaxConfig);
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'filterProvider',
    eventLabel: provider
  });  
}

function goToPrefixes(cell) {
  console.log(cell);
  var client = cell.originalTarget.textContent.toLowerCase();
  table.setData(apiUrl+"prefixes/totals?client-id=" + client,{}, ajaxConfig);
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'filterClient',
    eventLabel: client
  });  
}

function FindTaskById(task) {

  if (task.id === this[0]) {
      return task;
  }
}

function getCsv(){
  table.download("csv", "data.csv");
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'download',
    eventLabel: 'csv'
  });  
}


var table = new Tabulator("#doi-production-table", {
  responsiveLayout:true,
  layout:"fitColumns",
  ajaxResponse:function(url, params, response){

    
    
    var myList2 = response.map(function(element) {
      console.log(element.states);
      if(element.states == null) {
        var findable = {"count":"0"}
        var registered = {"count":"0"}
        var draft = {"count":"0"}
      }else{
        var findable = element.states.find(FindTaskById,['findable']);
        var registered = element.states.find(FindTaskById,['registered']);
        var draft = element.states.find(FindTaskById,['draft']);       
      }

      // if(element.temporal == null) {
      //   var this_year = {"count":"0"}
      //   var last_year = {"count":"0"}
      //   var this_month = {"count":"0"}
      // } else{
      //   var this_year = element.temporal.this_year[0];
      //   var last_year = element.temporal.last_year[0];
      //   var this_month = element.temporal.this_month[0];      
      // }

      if(!registered){
        registered = {"count":"0"}
      }
      if(!draft){
        draft = {"count":"0"}
      }
    
      return {"id": element.id, 
        "total": element.count, 
        "findable": findable.count, 
        "registered": registered.count, 
        "draft": draft.count
        // "this_year": this_year.count
        // , 
        // "last_year": last_year.count , 
        // "this_month": this_month.count
      };
    });

    return myList2; 
  },
  columns:[
      {title:"Name", field:"id", sorter:"string", cellClick:goToClients,responsive:0},
      {title:"Total", field:"total", sorter:"string", align:"right", formatter:"money", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"2019", field:"this_year", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"2018", field:"last_year", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"This month", field:"this_month", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"Findable", field:"findable", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"Registered", field:"registered", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},
      {title:"Draft", field:"draft", align:"right", formatter:"number", bottomCalc:"sum",formatterParams:{precision:false}},],
});

table.setData(apiUrl + "providers/totals",{}, ajaxConfig);
table.setSort("id", "asc");
