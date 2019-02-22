function displayProviders(task) {

  goHome();
  table.setData(apiUrl+"/providers/totals");
  $("li#client_level").hide();
  $("li#member_level").hide();
  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'providers',
    eventLabel: 'allproviders'
  });  
}

function displayClients(task) {
  goHome();
  table.setData(apiUrl+"/clients/totals");
  $("li#client_level").hide();
  $("li#member_level").hide();

  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'clients',
    eventLabel: 'allclients'
  });  
}

function displayPrefixes(task) {
  goHome();
  table.setData(apiUrl+"/prefixes/totals");
  $("li#client_level").hide();
  $("li#member_level").hide();

  ga('send', {
    hitType: 'event',
    eventCategory: 'stats',
    eventAction: 'prefixes',
    eventLabel: 'allprefixes'
  });  
}


function goHome(){
  if(window.location.pathname != '/'){
    window.location = '/';
  }
}
