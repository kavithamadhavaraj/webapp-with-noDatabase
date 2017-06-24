/*function triggerAction()
{
  var message=Logger.getLog();
  MailApp.sendEmail("guesthousebookingadmin@gmail.com","Log Information",message);
}*/
function doGet(){
  var html=HtmlService.createHtmlOutputFromFile("source");
  html.setTitle("Online Guest House Booking");
  return html;
}
function userCheck(){
  var id=Session.getActiveUser().getEmail();
  if((id=="guesthousebookingadmin@gmail.com")||(id=="otheruser@gmail.com"))
    return id;
  else
    return 'false';
}
function checkAvailability(fromdate,todate)
{
  var rooms=[];
  var j=0;
  //Sample calenderID = kd8llr4f83u80gvlqm30lkc8jk@group.calendar.google.com
  var calendarid=["calenderID1","calenderID2"];
  for(var i=0;i<calendarid.length;i++)
  {
     var calendar = CalendarApp.getCalendarById(calendarid[i]);
     var event=null;
     var startdate=new Date(fromdate);
     var enddate=new Date(todate);
     if(fromdate==todate)
      event=calendar.getEventsForDay(new Date(fromdate))[0];
     else
      event=calendar.getEvents(new Date(startdate.getTime() + (5 * 90 * 60 * 1000)),new Date(enddate.getTime() + (5 * 90 * 60 * 1000)),{max: 1})[0];
     if(event==null)    rooms[j++]=i;
  }
  return rooms;
}
function calendarAction(guestdata,datedata,id){
  var calendarid = ["calenderID1","calenderID2"];
  var calendar = CalendarApp.getCalendarById(calendarid[guestdata[0]]);
  //Replace your script URL, so the user can come back to view the status
  var url="https://script.google.com/a/macros/11111111111111111111111111111111111111111111/exec";
  var message="Booking Details! \nYou have booked for "+guestdata[1]+" - "+guestdata[2]+"\nDetails : "+calendar.getName()+" from "+datedata[0]+" to "+datedata[1]+"\nPurpose:"+guestdata[4]+".\nContact:"+guestdata[3]+".\n\n\nIn case of cancelling visit - "+url;
  var event=null;
  var startdate=new Date(datedata[0]);
  var enddate=new Date(datedata[1]);  
  if(datedata[0]==datedata[1])
      event=calendar.getEventsForDay(new Date(datedata[0]))[0];
  else
       event=calendar.getEvents(new Date(startdate.getTime() + (5 * 90 * 60 * 1000)),new Date(enddate.getTime() + (5 * 90 * 60 * 1000)),{max: 1})[0];
  if(event==null)
  {
      event=calendar.createEventFromDescription(guestdata[1]+" from "+datedata[0]+" to "+datedata[1]);
      event.setLocation(guestdata[2]);
      event.addGuest(guestdata[5]);
      event.setDescription(guestdata[4]);
      event.setTag("Contact",guestdata[3]);
      MailApp.sendEmail(id,"Guest House Booking Details",message);
      MailApp.sendEmail(guestdata[5],"Guest House Booking Details","You have been assigned as the Co-ordinating faculty for the below mentioned Guest:\n"+guestdata[1]+" - "+guestdata[2]+"\nDetails : "+calendar.getName()+" from "+datedata[0]+" to "+datedata[1]+"\nPurpose:"+guestdata[4]+".\nContact:"+guestdata[3]+".\nIn case of any discrepancies contact your concerned HOD.");
      return "Booked Successfully !! Check Your mail for details !!";
  }
  else return "Room is currently Unavailable!";
}
function getBookedData(user)
{
    var data=[];
    var events;
    var startdate = new Date();
    var enddate = new Date();
    var temp="";
    var k=0;
    enddate.setDate(30);
    enddate.setMonth((startdate.getMonth())+5);
    var calendarid = [calenderID1,calenderID2];
    for(var j=0;j<calendarid.length;j++)
    {
     events=null;
     var calendar = CalendarApp.getCalendarById(calendarid[j]);
     if(user=="guesthousebookingadmin@gmail.com")
      events = calendar.getEvents(new Date(startdate.getTime() + (5 * 90 * 60 * 1000)),new Date(enddate.getTime() + (5 * 90 * 60 * 1000)));
     else
      events = calendar.getEvents(new Date(startdate.getTime() + (5 * 90 * 60 * 1000)),new Date(enddate.getTime() + (5 * 90 * 60 * 1000)),{author:user});
     for(var i=0;i<events.length;i++)
     {
       data[k]=[];
       data[k][0]=calendar.getName();
       data[k][1]=events[i].getStartTime();
       data[k][2]=events[i].getEndTime();
       data[k][3]=events[i].getTitle();
       data[k][4]=events[i].getLocation();
       data[k][5]=events[i].getDescription();
       data[k][6]=events[i].getGuestList()[0].getEmail();
       data[k++][7]=events[i].getTag("Contact")+"$";
     }
   }
   temp=data.join();
   return temp;
 }
 function deleteEvent(details)
 {
   var calid;
   if(details[0]=="Room 1")
     calid="calenderID1";
   else // add more rooms here
     calid="calenderID2";
   var calendar=CalendarApp.getCalendarById(calid);
   var event=calendar.getEventsForDay(new Date(details[1]))[0];
   event.deleteEvent();
   MailApp.sendEmail(details[2],"Cancellation","Your booking was cancelled by "+details[2]+".Ignore if you have cancelled otherwise contact administrator.\nBooking Details:\n Guest :"+details[3]+"Room:"+details[0]);
   MailApp.sendEmail("guesthousebookingadmin@gmail.com","Cancellation","Booking was cancelled by "+details[2]+"\nBooking Details:\n Guest :"+details[3]+"Room:"+details[0] );
   return "Deleted Successfully!";
}
 function updateEvent(details)
 {
   var calid;
   if(details[0]=="Room 1")
     calid="calenderID1";
   else if(details[0]=="Room 2")
     calid="calenderID2";
   else {}
   var calendar=CalendarApp.getCalendarById(calid);
   var event=calendar.getEventsForDay(new Date(details[7]))[0];
   event.setTitle(details[1]);
   event.setLocation(details[2]);
   event.setDescription(details[3]);
   event.addGuest(details[4]);
   MailApp.sendEmail(details[4],"Guest House Booking Details","You have been assigned as the Co-ordinating faculty for the below mentioned Guest:\n"+details[1]+" - "+details[2]+"\nDetails : "+details[3]+".\nContact:"+details[5]+".\nIn case of any discrepancies contact your concerned HOD.");
   event.setTag("Contact",details[5]);
   return "Updated Successfully!";
}
