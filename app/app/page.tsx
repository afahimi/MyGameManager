"use client";
import styles from "./Home.module.css";
import Head, { defaultHead } from "next/head";
import { Roboto } from "next/font/google";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import DataTable from "./components/data_table";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Col from "react-bootstrap/Col";

import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

import { getAllTableNames, getTableData } from "./utils/functions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { table } from "console";
import { OracleServerRequest } from "./utils/functions.ts";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

type RecordType = Record<string, string>;

const Home = () => {
  const [query, setQuery] = useState<Record<string, string>>({});
  const [defaultQuery, setDefaultQuery] = useState("");
  const [result, setResult] = useState([]);

  const [sideMenuVisible, setSideMenuVisible] = useState("true");

  const [tableNames, setTableNames] = useState([]);
  const [currTable, setCurrTable] = useState("");
  const [operation, setOperation] = useState<string>("");

  const [projectSelections, setProjectSelections] = useState<string[]>([]);

  const operations = [
    "INSERT",
    "DELETE",
    "UPDATE",
    "SELECT",
    "PROJECT",
    "JOIN",
    "AGGREGATION",
    "RAW QUERY",
  ];

  const handleProjectCheckboxChange = (checked: boolean, key: string) => {
    if (checked) {
      console.log("checked");
      setProjectSelections((prevSelections) => [...prevSelections, key]);
    } else {
      console.log("unchecked");
      setProjectSelections((prevSelections) =>
        prevSelections.filter((item) => item !== key)
      );
    }
    console.log(projectSelections);
  };

  const generateProjectElements = () => {
    if (result.length === 0) {
      return null;
    }

    const uniqueKeys = new Set(Object.keys(result[0]));
    const uniqueKeysArray = Array.from(uniqueKeys);

    return uniqueKeysArray.map((key, index) => {
      return (
        <Form.Check
          key={`${key}-${index}`}
          type="checkbox"
          label={key}
          onChange={(e) => handleProjectCheckboxChange(e.target.checked, key)}
        />
      );
    });
  };

  /* Make all query boxes independent */
  const handleInputChange = (fieldName: string, value: string) => {
    console.log(defaultQuery);
    setQuery((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    getAllTableNames()
      .then((res: any) => {
        console.log("success:", res);
        setTableNames(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  async function changeVisibleTable(table_name: string) {
    setResult([]);
    setCurrTable(table_name);
    setDefaultQuery("");
    setQuery({});
    try {
      let data: any = await getTableData(table_name);
      setResult(data);
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  const createFormControlElements = () => {
    if (result.length === 0) {
      return null;
    }
    const keys = Object.keys(result[0]);

    return keys.map((key, index) => {
      return (
        <Form.Control
          key={index}
          type="text"
          placeholder={key}
          onChange={(e) => handleInputChange(key, e.target.value)}
        />
      );
    });
  };

  const [field, setField] = useState<any[]>([]);

  interface OperationUI {
    [key: string]: JSX.Element;
  }

  const operationUI: OperationUI = {
    SELECT: (
      <>
        <Form>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter query"
              value={defaultQuery}
              onChange={(e) => setDefaultQuery(e.target.value)}
            />
          </Form.Group>
        </Form>
      </>
    ),

    INSERT: (
      <>
        <Form>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),

    DELETE: (
      <>
        <Form>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),

    UPDATE: (
      <>
        <Form>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Set"
              value={defaultQuery}
              onChange={(e) => setDefaultQuery(e.target.value)}
            />
          </Form.Group>
          <Form.Group>{createFormControlElements()}</Form.Group>
        </Form>
      </>
    ),

    PROJECT: (
      <>
        <Form>
          <div className={styles.project_form}>{generateProjectElements()}</div>
        </Form>
      </>
    ),

    "RAW QUERY": (
      <>
        <Form>
          <Form.Control
            type="text"
            placeholder="Enter raw SQL commands"
            value={defaultQuery}
            onChange={(e) => setDefaultQuery(e.target.value)}
          />
        </Form>
      </>
    ),
  };

  /* Given the values generate a query to execute and toss it to postRequest */
  const handleExecuteQuery = async () => {
    setResult([]);
    let executeQuery = "";
    switch (operation) {
      case "SELECT":
        let string = defaultQuery ? `${defaultQuery}` : "*";
        executeQuery = `SELECT ${string} FROM ${currTable}`;
        break;

      case "INSERT":
        let entities = Object.keys(query).join(",");
        let values = Object.values(query)
          .map((entity: string) => `'${entity}'`)
          .join(",");
        executeQuery = `INSERT INTO ${currTable} (${entities}) VALUES (${values});`;
        break;

      case "DELETE":
        let conditions = Object.entries(query)
          .filter(([key, value]) => value.trim() !== "")
          .map(([key, value]) => `${key} = '${value}'`)
          .join(" AND ");
        executeQuery = `DELETE FROM ${currTable} WHERE ${conditions};`;
        break;

      case "UPDATE":
        let updates = Object.entries(query)
          .filter(([key, value]) => value.trim() !== "")
          .map(([key, value]) => `${key} = '${value}'`)
          .join(" AND ");
        executeQuery = `UPDATE ${currTable} SET ${defaultQuery} WHERE ${updates};`;
        break;

      case "PROJECT":
        setProjectSelections([]);
        executeQuery = `SELECT ${projectSelections.join(
          ","
        )} FROM ${currTable}`;
        break;

      case "RAW QUERY":
        executeQuery = defaultQuery;
    }
    setResult(await OracleServerRequest(executeQuery));
    // await changeVisibleTable(currTable)
  };

  function handleDebugSubmit(event: any) {
    OracleServerRequest(event.message);
    event?.preventDefault();
  }

  const getTableResults = (result: any) => {
    if (result.length > 0) {
      return <DataTable data={result} />;
    } else {
      return <Spinner animation="border" />;
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className="flex h-full w-full">
          <div className="bg-slate-200 h-full mr-3">
            <h1
              className={`p-5 text-3xl font-onest text-slate-950 ${
                sideMenuVisible ? "" : "hidden"
              }`}
            >
              Database Query
            </h1>
            <ListGroup as={"ul"}>
              {tableNames.map((tableName: any, count) => {
                return (
                  <ListGroup.Item
                    key={count}
                    as={"li"}
                    className="mt-2"
                    onClick={() => {
                      changeVisibleTable(tableName.TABLE_NAME);
                    }}
                  >
                    {tableName.TABLE_NAME}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </div>

          <div>
            <div className={styles.btn_group}>
              <ButtonGroup aria-label="Basic example">
                {operations.map((operation, count) => {
                  return (
                    <Button
                      key={count}
                      variant="outline-primary"
                      onClick={() => {
                        setOperation(operation);
                      }}
                    >
                      {operation}
                    </Button>
                  );
                })}
              </ButtonGroup>
            </div>
            <div className={styles.form}>
              {operationUI[operation] ? operationUI[operation] : null}
            </div>
            <div className={styles.reset_btn}>
              <Button onClick={() => {changeVisibleTable(currTable)}} variant="outline-primary">
                Reset View
              </Button>
            </div>
            <Button onClick={handleExecuteQuery} variant="outline-primary">
              Execute Query
            </Button>
            <div className="text-cyan-800">
              {currTable
                ? `Current Table: ${currTable}`
                : "Select a table to view"}
            </div>
            <div className={styles.table}>{getTableResults(result)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
