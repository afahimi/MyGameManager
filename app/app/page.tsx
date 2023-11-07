"use client";
import styles from "./Home.module.css";
import Head from "next/head";
import { Roboto } from "next/font/google";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

const Home = () => {
  const [query, setQuery] = useState("");

  const postRequest = async () => {
    console.log("query: " + query)
    const requestOptions = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    };
    console.log("sending post request");
    await fetch("https://www.students.cs.ubc.ca/~afahimi/index.php", requestOptions)
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));
  };

  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>RPG Database Query</h1>
        <div className={styles.form}>
          <Form>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>
        <Button onClick={postRequest} variant="outline-primary">
          Execute Query
        </Button>
      </div>
    </>
  );
};

export default Home;
