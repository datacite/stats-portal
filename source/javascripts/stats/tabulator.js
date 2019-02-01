
function FindTaskById(task) {

  if (task.id === this[0]) {
      return task;
  }
}

function goToSearch(id) {
  console.log(id);
  console.log(id.explicitOriginalTarget.innerText);
  window.open("http://localhost:8065/clients?provider-id=" + id.explicitOriginalTarget.innerText); 

}




var table = new Tabulator("#doi-production-table", {
  // data:myList2,
  ajaxResponse:function(url, params, response){
    //url - the URL of the request
    //params - the parameters passed with the request
    //response - the JSON object returned in the body of the response.

    function FindTaskById(task) {

      if (task.id === this[0]) {
          return task;
      }
    }
    
    
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
    
      return {"allocator": element.id, 
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

    return myList2; //return the tableData property of a response json object
  },
  columns:[
      {title:"Member", field:"allocator", sorter:"string", width:500, editor:false, cellClick:goToSearch},
      {title:"Total", field:"total", sorter:"string", align:"right", formatter:"number", bottomCalc:"sum"},
      {title:"2019", field:"this_year", align:"right", formatter:"number", bottomCalc:"sum"},
      {title:"2018", field:"last_year", align:"right", formatter:"number", bottomCalc:"sum"},
      {title:"This month", field:"this_month", align:"right", formatter:"number"},
      {title:"Findable", field:"findable", align:"right", formatter:"number"},
      {title:"Registered", field:"registered", align:"right", formatter:"number", bottomCalc:"sum"},
      {title:"Draft", field:"draft", align:"right", formatter:"number", bottomCalc:"sum"},],
});

var ajaxConfig = {
  method:"get", //set request type to Position
  cache: "force-cache",
  headers: {
      "Authorization": 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOiIwMDAwLTAwMDEtNTQ4OS0zNTk0IiwibmFtZSI6ImRhdGFvbmUiLCJwcm92aWRlcl9pZCI6ImNkbCIsImNsaWVudF9pZCI6ImNkbC5kYXRhb25lIiwicm9sZV9pZCI6InN0YWZmX2FkbWluIiwiaWF0IjoxNTM4NDk2MDcxLCJleHAiOjE4MTgxODE4MTgxODI4MjgyMjkzOTM1OTgyOTQwNTE1fQ.wp12DEEB3iho9Iy0t-eoeA9pipdvBsKcOdXezSDIE-8TX90_2bjnRnT10V5VciJs7O3hZjbaWYTbpp-jIiLw5ib-uyfoR8Yl00XrelzyMT0Jgd6hU8BP2QhWtR_GWTJREXx3-rTWOBYGcKF0ptRMtKn8K0uuth4EMuySnakVDQYmPwzoocjC5LP2UEXq3cy2qE8j-JIU5XZwvkWHv7R_UVuGrFr9GFJdvY7Fy7K45uM9xXJyqqruZj9oyS5U0-SugHVgVlMz0JrFSCRX0CUVVLTF_09RgUMgWoINzs2sI84EHFfs1QnL5X5gyMn-8zhsb-qDts5D409xwCPBg8ydaA', //set specific content type
  },
};

table.setData("http://localhost:8065/providers/totals",{}, ajaxConfig);
// table.setData("https://api.datatcite.org/providers/totals",{}, ajaxConfig);
