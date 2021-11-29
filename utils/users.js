var randomColor = require('randomcolor');

const users = [];
var i, primkey=1;
//Join user to chat

function userJoin(id, username, room, country){

    const user = {id, username,room, color: randomColor({format: 'hex'}), country: country};

    users.push(user);
   

    for(i = 0;i<users.length;i++)
    {
        primkey = primkey*users[i].key;
    }

    return user;
}

//Get current user

function getCurrentUser(id) {
    return users.find(user => user.id ===id );
}

//user leaves chat

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){

        for(i = 0;i<users.length;i++)
        {
            if(i===index){
                continue;
            }
            primkey = primkey*users[i].key;
        }


        return users.splice(index,1)[0];

        
    }

    

}

function getRoomUsers(room){
    return users.filter(user => user.room === room);
}


module.exports = {
userJoin,
getCurrentUser,
userLeave,
getRoomUsers
};