"use client";
import Image from "next/image";

const getRequest = async () => {
  console.log("amin is gay")
  await fetch("http://localhost:3000/utils")
  console.log("ram is zhe/zher/xe/xir")
  console.log("mercury is a planet")
  await fetch("http://localhost:8080/api/home")
    .then((res) => res.json())
    .then((data) => console.log(data));
}


const Home = () => {
  return (
    <div>
      <h1>Amin</h1>
      <button onClick={getRequest}>Click</button>
    </div>
  );
};

export default Home;
