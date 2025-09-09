import {
  doc,
  getDoc,
  collection,
  setDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  runTransaction,
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

const decideAboutUserGroups = async (userId: string, expId: string) => {
  try {
    const expRef = doc(db, "experiments", expId);

    const groupId = await runTransaction(db, async (tx) => {
      const expSnap = await tx.get(expRef);
      if (!expSnap.exists()) throw new Error("Experiment not found");

      const expData = expSnap.data() as any;
      const groups: string[] = Array.isArray(expData?.groups) ? expData.groups : [];
      const capacity: number = Number(expData?.settings?.usersInGroup ?? 4);

      // First, try to place the user into an existing group
      for (const gid of groups) {
        const gRef = doc(db, "groups", gid);
        const gSnap = await tx.get(gRef);
        if (!gSnap.exists()) continue;

        const gData = gSnap.data() as any;
        const users: string[] = Array.isArray(gData?.users) ? gData.users : [];

        // If the user already belongs to this group, return it
        if (users.includes(userId)) {
          return gid;
        }

        // If there is room, add the user atomically
        if (users.length < capacity) {
          tx.update(gRef, { users: arrayUnion(userId) });
          return gid;
        }
      }

      // No available group found; create a new one atomically
      const newIndex = groups.length + 1;
      const newGroupRef = doc(collection(db, "groups")); // pre-generate id for transaction
      const groupType = newIndex % 2 === 0 ? "noEmojy" : "emojy";

      tx.set(newGroupRef, {
        users: [userId],
        experimentId: expRef.id,
        groupType,
        messages: [],
        name: `group-${newIndex}`,
        id: `exp-${expRef.id}-group-${newIndex}`,
        createdAt: serverTimestamp(),
      });

      // Append the group reference without overwriting concurrent updates
      tx.update(expRef, { groups: arrayUnion(newGroupRef.id) });

      return newGroupRef.id;
    });

    return groupId;
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
