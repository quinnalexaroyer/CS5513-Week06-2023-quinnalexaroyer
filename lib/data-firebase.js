import app from "./firebase-app";
import {getFirestore, collection, doc, getDocs, getDoc} from "firebase/firestore";

const db = getFirestore(app);

export async function getSortedList() {
  const snapshot = await getDocs(collection(db, "presidents"));
  const jsonObject = snapshot.docs.map(
    (d) => ({
      id:d.id,
      ...d.data()
    })
  );
  jsonObject.sort(
    function(x,y) {
      return x.name.localeCompare(y.name);
    }
  );
  return jsonObject.map(
    function(it) {
      return {
        params: {
          id:it.id.toString(),
          name:it.name,
          rank:it.rank.toString()
        }
      };
    }
  );
}

export async function getAllIDs() {
  const snapshot = await getDocs(collection(db, "presidents"));
  const jsonObject = snapshot.docs.map(
    (d) => (
      {
        id: d.id
      }
    )
  );
  return jsonObject.map(
    function(it) {
      return {
        params: {
          id:it.id.toString()
        }
      };
    }
  );
}

async function getPresidentByRank(rank) {
  const snapshot = await getDocs(collection(db, "presidents"));
  const jsonObject = snapshot.docs.map(
    (d) => ({
      id:d.id,
      ...d.data()
    })
  );
  let toReturn = jsonObject.filter(
    function(it) {
      if(Number.isInteger(it.rank)) return it.rank == rank;
      else if(Array.isArray(it.rank)) return it.rank.includes(rank);
    }
  );
  if(toReturn.length > 0) {
    return toReturn[0];
  }
}

async function getPrevPresident(rank) {
  if(rank > 1) {
    let prev = await getPresidentByRank(rank-1);
    if(Array.isArray(prev.rank)) {
      for(var i=0; i<prev.rank.length; i++) {
        if(prev.rank[i] == rank-1) {
          prev.index = i;
        }
      }
    }
    return prev;
  } else {
    return {id:''};
  }
}

async function getNextPresident(rank) {
  if(rank < 46) {
    let next = await getPresidentByRank(rank+1);
    if(Array.isArray(next.rank)) {
      for(var i=0; i<next.rank.length; i++) {
        if(next.rank[i] == rank+1) {
          next.index = i;
        }
      }
    }
    return next;
  } else {
    return {id:''};
  }
}

export async function getData(idRequested) {
  const docRef = doc(db, "presidents", idRequested);
  const d = await getDoc(docRef);
  let toReturn;
  if(!d.exists) {
    toReturn = {}
  } else {
    toReturn = d.data();
    let prev, next;
    if(typeof toReturn.rank === 'number') {
      prev = await getPrevPresident(toReturn.rank);
      next = await getNextPresident(toReturn.rank);
    } else if(Array.isArray(toReturn.rank)) {
      prev = Array();
      next = Array();
      for(var i=0; i<toReturn.rank.length; i++) {
        prev.push(await getPrevPresident(toReturn.rank[i]))
        next.push(await getNextPresident(toReturn.rank[i]))
      }
    }
    toReturn.birth = writeDate(toReturn.birth);
    toReturn.death = writeDate(toReturn.death);
    if(Array.isArray(prev) && Array.isArray(next)) {
      for(var i=0; i<prev.next; i++) {
        
      }
    } else {
      toReturn.prevID = prev.id;
      toReturn.nextID = next.id;
      toReturn.prevName = prev.name;
      toReturn.nextName = next.name;
    }
    toReturn.start = getTermDate(toReturn.start, prev.death);
    if(Array.isArray(next.start)) {
      toReturn.end = getTermDate(next.start[next.index], toReturn.death);
    } else {
      toReturn.end = getTermDate(next.start, toReturn.death);
    }
  }
  return toReturn;
}

function monthName(m) {
  switch(m) {
  case 1:
    return "January";
    break;
  case 2:
    return "February";
    break;
  case 3:
    return "March";
    break;
  case 4:
    return "April";
    break;
  case 5:
    return "May";
    break;
  case 6:
    return "June";
    break;
  case 7:
    return "July";
    break;
  case 8:
    return "August";
    break;
  case 9:
    return "September";
    break;
  case 10:
    return "October";
    break;
  case 11:
    return "November";
    break;
  case 12:
    return "December";
    break;
  }
}
function isDigit(d) {
  return d == '0' || d == '1' || d == '2' || d == '3' || d == '4'
      || d == '5' || d == '6' || d == '7' || d == '8' || d == '9';
}
function writeDate(d) {
  if(typeof d === 'string'
    && d.length >= 8 
    && isDigit(d[0])
    && isDigit(d[1])
    && isDigit(d[2])
    && isDigit(d[3])
    && isDigit(d[4])
    && isDigit(d[5])
    && isDigit(d[6])
    && isDigit(d[7])
  ) {
    return (monthName(parseInt(d.slice(4,6)))
          + " " + parseInt(d.slice(6,8)).toString()
          + ", " + parseInt(d.slice(0,4)).toString());
  } else {
    return d;
  }
}

function getTermDate(n, death) {
  if(Number.isInteger(n)) {
    if(n > 1951) {
      return writeDate(n.toString() + "0120");
    } else if(n > 0) {
      return writeDate(n.toString() + "0304");
    } else {
      return writeDate(death);
    }
  } else {
    let year = Math.floor(n);
    let month = Math.floor(100*(n-year));
    let day = Math.floor(10000*(n-year-month/100));
    return writeDate(year.toString() + month.toString().padStart(2,'0') + day.toString().padStart(2,'0'));
  }
}