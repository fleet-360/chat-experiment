import {
  doc,
  getDoc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  addDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import type {  UserProfile } from "../types/app";
const postOrGetUserId = async (id:string,expId:string) => {
  try {
    const userRef = doc(db, "users", id);
    const docRef = await getDoc(userRef);
    const group = await decideAboutUserGroups(id, expId);
    console.log("group",group);
    
    if (!docRef.exists()) {
      await setDoc(userRef, {  id, group });
      console.log(
        `User created with ID: ${id}, group: ${group}`
      );
      return {  id, group };
    } else {
      console.log(`User fetched with ID: ${id}`);
      await updateDoc(userRef, { group });
      return (await getDoc(userRef)).data();
    }
  } catch (error) {
    console.error("Error in postOrGetUserId:", error);
  }
};

const decideAboutUserGroups = async (userId: string,expId:string) => {
  try {
    const expRef = doc(db, "experiments", expId);
    const expSnap = await getDoc(expRef);
    if (!expSnap.exists()) throw new Error("Experiment not found");

    const expData = expSnap.data() as any;
    const groups: string[] = Array.isArray(expData?.groups) ? expData.groups : [];
    const capacity: number = Number(expData?.settings?.usersInGroup ?? 4);3

    let chosenGroupId: string | null = null;
    for (const gid of groups) {
      const gRef = doc(db, "groups", gid);
      const gSnap = await getDoc(gRef);
      
      if (!gSnap.exists()) continue;
      const gData = gSnap.data() as any;
      const users: string[] = Array.isArray(gData?.users) ? gData.users : [];

      if (users.includes(userId)) {
        return gid
      }

      if (!users.includes(userId) && users.length < capacity) {
        await updateDoc(gRef, { users: arrayUnion(userId) });
        chosenGroupId = gid;
        // Track if the group became full if needed in future
        break;
      }
    }

    // If no not-full group found, create a new one and place at the beginning
    if (!chosenGroupId) {
      const newGroupRef = await addDoc(collection(db, "groups"), {
        users: [userId],
        experimentId:expRef.id,
        groupType:groups.length%2==0 ?"emojy": "noEmojy",
        messages:[],
        name:`group-${groups.length}`,
        id:`exp-${expRef.id}-group-${groups.length}`,
        createdAt: serverTimestamp(),
      } );
      const newGroups = [...groups,newGroupRef.id];
      await updateDoc(expRef, { groups: newGroups });
      return newGroupRef.id;
    }

    // If the chosen group is now full, create a new empty group and unshift it
    // if (becameFull) {
    //   const newGroupRef = await addDoc(collection(db, "groups"), {
    //     users: [],
    //     groupType: groups.length % 2 == 0 ? "emojy" : "noEmojy",
    //     messages: [],
    //     name: `group-${groups.length}`,
    //     id: `exp-${expRef.id}-group-${groups.length}`,
    //     createdAt: serverTimestamp(),
    //   });
    //   const newGroups = [...groups, newGroupRef.id];
    //   await updateDoc(expRef, { groups: newGroups });
    // }

    return chosenGroupId;
  } catch (error) {
    console.error("Error in decideAboutUserGroups:", error);
  }
};

const setUserOnDb = async (user :UserProfile) => {
  try {
    const userRef = doc(db, "users", user.id);
    let didAnswerAttentionQuestion =
      localStorage.getItem("attentionQuestion") === "0";
    await setDoc(userRef, { ...user, didAnswerAttentionQuestion });
    console.log(`User updated with ID: ${user.id}`);
  } catch (error) {
    console.error("Error in setUser:", error);
  }
};

const getAllUsers = async () => {
  try {
    const coll = collection(db, "users");
    const snapshot = await getDocs(coll);
    const users = snapshot.docs.map((doc) => doc.data());
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
  }
};

export { postOrGetUserId, setUserOnDb, getAllUsers };
