//Login Form
function logIn() {
    var email = document.getElementById('email');
    var pswd = document.getElementById('pswd');
    var promise = firebase.auth().signInWithEmailAndPassword(email.value, pswd.value);
    promise.catch(e => document.getElementById('alertMsgForNoAccount').classList.remove('hide'));
}

//Signup Form
function signUp() {
    var email = document.getElementById('email');
    var pswd = document.getElementById('pswd');
    var promise = firebase.auth().createUserWithEmailAndPassword(email.value, pswd.value);
    promise.catch(e => document.getElementById('alertMsgForAlreadyAccount').classList.remove('hide'));
    firebase.auth().onAuthStateChanged( firebaseUser => {
        if(firebaseUser) {
            document.getElementById('signInAccount').classList.remove('hide');
        }
    });
}

//Logout Form
function logOut() {
    firebase.auth().signOut();    
    var orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    alertUnhide();
}

var userID;
var formDiv = document.getElementById('topForm');
var objDiv = document.getElementById('objectDiv');

//On statechanged
firebase.auth().onAuthStateChanged( firebaseUser => {
    if(firebaseUser) {
        var email = document.getElementById('email');
        var pswd = document.getElementById('pswd');
        userID = firebaseUser.uid;
        formDiv.classList.add('hide');
        objDiv.classList.remove('hide');
        logout.classList.remove('hide');
        email.value = pswd.value = "";
        //Now Call above function to display plans
        displayWork();
    }
    else{
        console.log("not logged in");
        formDiv.classList.remove('hide');
        objDiv.classList.add('hide');
        logout.classList.add('hide');
    }
});


//Data is adding in Firebase DB
function insertData() {
    var work = document.getElementById('workPlan');
    var time = document.getElementById('timePicker');
    if(work.value !== "" && time.value !== "") {
        var uniqueKey = firebase.database().ref(userID).push().key;
        var todoObject = {
            key: uniqueKey,
            work: work.value,
            time: time.value
        };
        //Data save to Firebase DB
        firebase.database().ref(userID + '/' + uniqueKey).set(todoObject);
        work.value = null;
        time.value = null;
    }
    else{
        var alert = document.getElementById('alertMsg');
        alert.classList.remove('hide');
    }
}

//Unhide Alert
function alertUnhide() {
    document.getElementById('alertMsgForNoAccount').classList.add('hide');
    document.getElementById('alertMsgForAlreadyAccount').classList.add('hide');
    document.getElementById('alertMsg').classList.add('hide');
    document.getElementById('signInAccount').classList.add('hide');
}

//Get Data on Web from Firebase on realTime
function displayWork() {
    var orderList = document.getElementById('orderList');
    var theDiv = document.getElementById('planCls');
    firebase.database().ref(userID).on('child_added', function(snapshot){
        var plan = document.createElement('li');
        var planWork = document.createElement('p');
        var planWorkTxt = document.createTextNode(snapshot.val().work);
        planWork.appendChild(planWorkTxt);
        var planTime = document.createElement('p');
        var planTimeTxt = document.createTextNode(snapshot.val().time);
        planTime.appendChild(planTimeTxt);
        var editBtn = document.createElement('button');
        var editBtnTxt = document.createTextNode('Edit');
        editBtn.appendChild(editBtnTxt);
        var deleteBtn = document.createElement('button');
        var deleteBtnTxt = document.createTextNode('Delete');
        deleteBtn.appendChild(deleteBtnTxt);
        plan.appendChild(planWork);
        plan.appendChild(planTime);
        plan.appendChild(editBtn);
        plan.appendChild(deleteBtn);
        scrolling();
        orderList.appendChild(plan);
        var planKey = snapshot.val().key;
        editBtn.setAttribute("class", "editBtnFunc");
        deleteBtn.setAttribute("class", "deleteBtnFunc");
        editBtn.onclick = function() {editFunc(planKey,this)};
        deleteBtn.onclick = function() {deleteFunc(planKey,this)};
    });
}

//Data div scroll or unscroll
function scrolling() {
    var orderList = document.getElementById('orderList');
    var theDiv = document.getElementById('planCls');
    if(orderList.childNodes.length < 11) {
        theDiv.style.overflowY = "hidden";
        theDiv.style.overflowX = "hidden";
    }
    else {
        theDiv.style.overflowY = "scroll";
        theDiv.style.overflowX = "hidden";
    }
}

//Delete Workplan from DB and Web
function deleteFunc(planKey, list) {
    firebase.database().ref(userID + '/' + planKey).remove();
    list.parentNode.remove();
    scrolling();
}

//Edit WorkPlan from DB and Web
function editFunc(planKey, list) {
    var previousWork = list.parentNode.firstChild.firstChild.nodeValue;
    var workEdit = prompt("Enter your Work here...", previousWork);
    var previousTime = list.parentNode.childNodes[1].firstChild.nodeValue;
    var timeEdit = prompt("Enter your Work time here... e.g:(18:30)", previousTime);
    firebase.database().ref(userID + '/'+ planKey).set({
        key: planKey,
        work: workEdit,
        time: timeEdit
    });
    list.parentNode.firstChild.firstChild.nodeValue = workEdit;
    list.parentNode.childNodes[1].firstChild.nodeValue = timeEdit;
}

//Delete all records from Firebase DB & Web
function deleteAllRecords() {
    firebase.database().ref(userID).remove();
    var orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    scrolling();
}
