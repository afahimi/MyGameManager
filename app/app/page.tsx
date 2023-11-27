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
import Dropdown from "react-bootstrap/Dropdown";

import Alert from "./components/Alert.tsx";
import { AlertProperty } from "./components/Alert.tsx";

import { UseSelector, useSelector } from "react-redux/es/hooks/useSelector";

import { getAllTableNames, getTableData } from "./utils/functions";
import { useAppDispatch, useAppSelector } from "./hooks";
import { error, table } from "console";
import { OracleServerRequest } from "./utils/functions.ts";
import { AGGREGATION_OPS } from "./utils/constants.ts";
import WhereHaving from "./components/where_having.tsx";
import { exec } from "child_process";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
});

type RecordType = Record<string, string>;

const Home = () => {
  const [query, setQuery] = useState<RecordType>({});
  const [defaultQuery, setDefaultQuery] = useState("");
  const [result, setResult] = useState([]);

  const [sideMenuVisible, setSideMenuVisible] = useState("true");

  const [tableNames, setTableNames] = useState([]);
  const [currTable, setCurrTable] = useState("");
  const [currTableKeys, setCurrTableKeys] = useState<Array<string>>([]);
  const [operation, setOperation] = useState<string>("");
  const [distinct, setDistinct] = useState<boolean>(false);

  const [projectSelections, setProjectSelections] = useState<string[]>([]);
  const [joinSelection, setJoinSelection] = useState<string>("");

  const [groupBy, setGroupBy] = useState<any[]>([]);
  const [groupByOperation, setGroupByOperation] = useState<string>("");

  const [joinTableResult, setJoinTableResult] = useState<any[]>([]);
  const [updateValues, setUpdateValues] = useState<Record<string, string>>({});

  const [divisorColumn, setDivisorColumn] = useState<string>("");

  const [whereHavingStr, setWhereHavingStr] = useState("");
  const [aggrKeys, setAggrKeys] = useState<string[]>([]);

  const [alert, setAlert] = useState<AlertProperty>({ isVisible: false, msg: '', op_result: 'success'});
  

  interface OracleError {
    ERROR: string;
  }
  /* Helper functions for error handling or input sanitizing */
  const operations = [
    "SELECT",
    "PROJECT",
    "JOIN",
    "AGGREGATION",
    "DIVISION",
    "INSERT",
    "DELETE",
    "UPDATE",
    "RAW QUERY",
  ];

  const sanitizeInputs = (str: string) => {
    const patterns = [
      /--/,
      /;/,
      /'/,
      /"/,
      /\bDROP\b/i,
      /\bSELECT\b/i,
      /\bINSERT\b/i,
      /\bWHERE\b/i,
      /\bFROM\b/i,
      /\bDELETE\b/i,
      /\bUPDATE\b/i,
      /\bUNION\b/i,
      /\bALTER\b/i,
      /\bEXEC\b/i,
      /\bEXECUTE\b/i,
      /\\/,
      /\bNULL\b/i,
      /%/i,
      /_/i,
    ];

    for (const pattern of patterns) {
      if (pattern.test(str)) {
        return "";
      }
    }

    return str;
  };

  const convertStringToIntIfPossible = (str: string) => {
    
    if(/^\d+$/.test(str)) {
      return parseInt(str, 10);
    }

    return str;
  };

  const returnProperString = (key: string, value: string) => {
    const converted = convertStringToIntIfPossible(value);
    return typeof converted === "number"
      ? `${key} = ${converted}`
      : `${key} = '${converted}'`;
  };

  const errorHandle = (err: OracleError[]) => {
    if (err && err.length > 0) {
      for (const element of err) {
        if (element.ERROR) {
          console.log(element.ERROR);
          return element.ERROR;
        }
      }
    }

    return "";
  };

  const requestResult = async (executeQuery: string) => {
    const result = await OracleServerRequest(executeQuery);
    console.log(result);
    if (errorHandle(result).length > 0) {
      showAlert("FAILURE: error exists", 'fail');
      setResult(result);
    } else {
      if (["INSERT", "DELETE", "UPDATE"].includes(operation)) {
        const updatedResult = await OracleServerRequest(
          `SELECT * FROM ${currTable}`
        );
        setResult(updatedResult);
      } else {
        setResult(result);
      }
      showAlert("SUCCESS!", 'success')
    }
  }

  const showAlert = (msg: string, op_result: 'success' | 'fail') => {
    setAlert({ isVisible: true, msg, op_result });

    setTimeout(() => {
        setAlert({ isVisible: false, msg: '', op_result: 'success' });
    }, 2000);
};

  /* ************************************************************ */

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
    setCurrTableKeys(Object.keys(result[0]));
  };

  const generateProjectElements = (
    res: string[] = result,
    tableName: string = currTable
  ) => {
    if (res.length === 0) {
      return null;
    }

    const uniqueKeys = new Set(Object.keys(res[0]));
    const uniqueKeysArray = Array.from(uniqueKeys);

    return uniqueKeysArray.map((key, index) => {
      return (
        <div key={`${key}-${index}`} className="text-black">
          <Form.Check
            type="checkbox"
            label={key}
            onChange={(e) =>
              handleProjectCheckboxChange(
                e.target.checked,
                `${tableName}.${key}`
              )
            }
          />
        </div>
      );
    });
  };

  const getTableAttributes = () => {
    if (result.length == 0) {
      return [];
    }
    const uniqueKeys = new Set(Object.keys(result[0]));
    return uniqueKeys;
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setQuery((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  const handleUpdateChange = (fieldName: string, value: string) => {
    setUpdateValues((prevQuery) => ({
      ...prevQuery,
      [fieldName]: value,
    }));
  };

  async function changeVisibleTable(table_name: string) {
    setResult([]);
    setCurrTable(table_name);
    setDefaultQuery("");
    setQuery({});
    setGroupByOperation("");
    setGroupBy([]);
    setWhereHavingStr("");
    try {
      let data: any = await getTableData(table_name);
      setResult(data);
    } catch (err) {
      console.error("ERROR: ", err);
    }
  }

  useEffect(() => {
    getAllTableNames()
      .then((res: any) => {
        console.log("success:", res);
        setTableNames(res);
        changeVisibleTable("CHARACTERINFO");
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const createFormControlElements = (handleFunction = handleInputChange) => {
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
          onChange={(e) => handleFunction(key, e.target.value)}
        />
      );
    });
  };

  const generateJoinElements = () => {
    if (tableNames.length === 0) {
      return null;
    }

    return tableNames.map((tableName: any, count) => {
      return (
        <Dropdown.Item
          key={count}
          onClick={() => {
            setJoinSelection(tableName.TABLE_NAME);
            getJoinSelectTable(tableName.TABLE_NAME);
            setDivisorColumn("");
          }}
        >
          {tableName.TABLE_NAME}
        </Dropdown.Item>
      );
    });
  };

  const generateDivisionMenuElements = () => {
    if (joinTableResult.length === 0) {
      return null;
    }
    const uniqueKeys = new Set(Object.keys(joinTableResult[0]));
    const uniqueKeysArray = Array.from(uniqueKeys);

    return uniqueKeysArray.map((key, index) => {
      return (
        <Dropdown.Item
          key={`${key}-${index}`}
          onClick={() => {
            setDivisorColumn(key);
          }}
        >
          {key}
        </Dropdown.Item>
      );
    });
  };

  const getJoinSelectTable = async (tableName: string) => {
    setJoinTableResult(await OracleServerRequest(`SELECT * FROM ${tableName}`));
  };

  const [field, setField] = useState<any[]>([]);

  interface OperationUI {
    [key: string]: JSX.Element;
  }

  const operationUI: OperationUI = {
    SELECT: (
      <>
        <div>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Select
          </h1>
          <Form>
            <div className={styles.project_form}>
              {generateProjectElements(result)}
            </div>
          </Form>
        </div>
        <div>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            From {currTable}
          </h1>
        </div>
        <div className="inline-flex space-x-4">
          WHERE
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
          />
        </div>
      </>
    ),

    JOIN: (
      <>
        <div className="inline-flex space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Select
          </h1>
          <Form.Check
            type="checkbox"
            label="Distinct"
            checked={distinct}
            onChange={(e) => setDistinct(e.target.checked)}
          />
          <Form>
            <div className={styles.project_form}>
              {generateProjectElements(result)}
              {generateProjectElements(joinTableResult, joinSelection)}
            </div>
          </Form>
        </div>
        <div className="inline-flex space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            From
          </h1>
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              {joinSelection ? joinSelection : "Select Table"}
            </Dropdown.Toggle>

            <Dropdown.Menu>{generateJoinElements()}</Dropdown.Menu>
          </Dropdown>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            , {currTable}
          </h1>
        </div>
        <div className="inline-flex space-x-4 mt-4">
          WHERE
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />

        </div>
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
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Target Row:
          </h1>
          <Form.Group>{createFormControlElements()}</Form.Group>
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Set values (or leave blank to not update):
          </h1>
          <Form.Group>
            {createFormControlElements(handleUpdateChange)}
          </Form.Group>
        </Form>
      </>
    ),

    PROJECT: (
      <>
        <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
          Select
        </h1>
        <Form>
          <div className={styles.project_form}>{generateProjectElements()}</div>
        </Form>
      </>
    ),

    AGGREGATION: (
      <div className="">
        <div className="flex justify-center items-center gap-2">
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupByOperation}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {AGGREGATION_OPS.map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() => setGroupByOperation(elem)}
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          (
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupBy[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(getTableAttributes()).map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() =>
                            setGroupBy((old: any) => [elem, old[1]])
                          }
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          )
        </div>

        <div className="flex justify-center items-center gap-2">
          Group By
          <Form>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                {groupBy[1]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(getTableAttributes()).map((elem) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={`2-${elem}`}
                        onClick={() => setGroupBy((old: any) => [old[0], elem])}
                      >
                        {elem}
                      </Dropdown.Item>
                    </>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Form>
        </div>
        <div className="inline-flex space-x-4">
          HAVING
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />
        </div>
      </div>
    ),
    NESTED_AGGREGATION: (
      <div className="">
        <div className="flex justify-center items-center gap-2">
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupByOperation}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {AGGREGATION_OPS.map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() => setGroupByOperation(elem)}
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          (
          <div>
            <Form>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {groupBy[0]}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {Array.from(getTableAttributes()).map((elem) => {
                    return (
                      <>
                        <Dropdown.Item
                          key={elem}
                          onClick={() =>
                            setGroupBy((old: any) => [elem, old[1]])
                          }
                        >
                          {elem}
                        </Dropdown.Item>
                      </>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form>
          </div>
          )
        </div>

        <div className="flex justify-center items-center gap-2">
          Group By
          <Form>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                {groupBy[1]}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {Array.from(getTableAttributes()).map((elem) => {
                  return (
                    <>
                      <Dropdown.Item
                        key={`2-${elem}`}
                        onClick={() => setGroupBy((old: any) => [old[0], elem])}
                      >
                        {elem}
                      </Dropdown.Item>
                    </>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Form>
        </div>
        <div className="inline-flex space-x-4">
          HAVING
          <WhereHaving
            isWhere={false}
            outputStr={whereHavingStr}
            setOutputStr={setWhereHavingStr}
            tableAttrributes={getTableAttributes()}
            setAttrs={setAggrKeys}
          />
        </div>
      </div>
    ),
    DIVISION: (
      <>
        <div className="inline-flex space-x-4">
          <h1 className={`text-xl font text-slate-950 text-middle font-bold`}>
            Divide {currTable} by
          </h1>
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
              {joinSelection ? joinSelection : "Select Table"}
            </Dropdown.Toggle>

            <Dropdown.Menu>{generateJoinElements()}</Dropdown.Menu>
          </Dropdown>
          {joinSelection ? (
            <>
              <h1
                className={`text-xl font text-slate-950 text-middle font-bold`}
              >
                column:
              </h1>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  {divisorColumn ? divisorColumn : "Select Divisor Column"}
                </Dropdown.Toggle>

                <Dropdown.Menu>{generateDivisionMenuElements()}</Dropdown.Menu>
              </Dropdown>
              <h1
                className={`text-xl font text-slate-950 text-middle font-bold`}
              >
                as:
              </h1>
              <Form>
                <Form.Control
                  type="text"
                  placeholder="Enter column"
                  value={defaultQuery}
                  onChange={(e) => setDefaultQuery(e.target.value)}
                />
              </Form>
            </>
          ) : null}
        </div>
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
    let where_clause = "";
    switch (operation) {
      case "SELECT":
        let string = defaultQuery ? `${defaultQuery}` : "*";
        setProjectSelections([]);
        where_clause = defaultQuery
          ? sanitizeInputs(defaultQuery) !== ""
            ? `WHERE ${sanitizeInputs(defaultQuery)}`
            : ""
          : "";
        executeQuery = `SELECT ${projectSelections.join(
          ","
        )} FROM ${currTable} ${where_clause}`;
        if (whereHavingStr !== "") {
          executeQuery += `WHERE ${whereHavingStr}`;
        }
        break;

      case "INSERT":
        let entities = Object.keys(query).join(",");
        let values = Object.values(query)
          .map((entity) => {
            const converted = convertStringToIntIfPossible(entity);
            return typeof converted === "number" ? converted : `'${converted}'`;
          })
          .join(",");
        executeQuery = `INSERT INTO ${currTable} VALUES (${values}); COMMIT`;
        break;

      case "DELETE":
        let condition = Object.entries(query)
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(" AND ");

        executeQuery = `DELETE FROM ${currTable} WHERE ${condition}; COMMIT`;
        break;

      case "UPDATE":
        let targetRow = Object.entries(query)
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(" AND ");

        console.log(updateValues);

        let updates = Object.entries(updateValues)
          .filter(([key, value]) => value.trim() !== "")
          .map(([key, value]) => {
            return returnProperString(key, value);
          })
          .join(", ");
        executeQuery = `UPDATE ${currTable} SET ${updates} WHERE ${targetRow}; COMMIT`;
        setUpdateValues({});
        break;

      case "PROJECT":
        setProjectSelections([]);
        executeQuery = `SELECT ${projectSelections.join(
          ","
        )} FROM ${currTable}`;
        break;

      case "JOIN":
        setProjectSelections([]);
        where_clause = defaultQuery
          ? sanitizeInputs(defaultQuery) !== ""
            ? `WHERE ${sanitizeInputs(defaultQuery)}`
            : ""
          : "";
        let distinctOn = distinct ? "DISTINCT" : "";
        executeQuery = `SELECT ${distinctOn} ${projectSelections.join(
          ", "
        )} FROM ${currTable}, ${joinSelection} ${where_clause}`;

        if (whereHavingStr !== "") {
          executeQuery += `WHERE ${whereHavingStr}`;
        }
        
        break;

      case "RAW QUERY":
        executeQuery = defaultQuery;
        break;

      case "AGGREGATION":
        if (groupBy[1] == undefined) {
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}) FROM ${currTable}`;
        } else {
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}), ${groupBy[1]} FROM ${currTable} GROUP BY ${groupBy[1]} `;
        }

        if (whereHavingStr !== "") {
          console.log(aggrKeys);
          executeQuery = `SELECT ${groupByOperation}(${groupBy[0]}), ${groupBy[1]} FROM ${currTable} GROUP BY ${groupBy[1]} `;
          executeQuery += `HAVING ${whereHavingStr}`;
        }
        console.log(executeQuery);
        break;

      case "DIVISION":
        const projections = projectSelections.join(", ");
        executeQuery = `
          CREATE OR REPLACE VIEW DIVIDEND AS
          SELECT ITEMID, INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY FROM PLAYER
          NATURAL JOIN CHARACTERINFO
          NATURAL JOIN CONTAINS;

          CREATE OR REPLACE VIEW TEMP_DIVIDEND AS
          SELECT DISTINCT INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY
          FROM DIVIDEND;

          CREATE OR REPLACE VIEW DIVISOR AS
          SELECT DISTINCT ITEMID FROM ITEM;

          CREATE OR REPLACE VIEW INTERMEDIATE AS
          SELECT * FROM DIVISOR, TEMP_DIVIDEND
          MINUS
          SELECT * FROM DIVIDEND;

          SELECT * FROM TEMP_DIVIDEND
          MINUS
          SELECT INVENTORYID, CHARACTERID, HEALTH, OVERALLLEVEL, MANA, CHARACTERNAME, INVENTORYQUANTITY FROM INTERMEDIATE;
          `;

        console.log(executeQuery);
        break;
    }

    // `
    // CREATE OR REPLACE VIEW TEMP_DIVIDEND AS
    // SELECT DISTINCT ITEMNAME FROM ITEM;
    // CREATE OR REPLACE VIEW DIVISOR AS
    // SELECT DISTINCT ITEMID AS ITEMID FROM TEMP;
    // CREATE OR REPLACE VIEW INTERMEDIATE AS
    // SELECT * FROM DIVISOR, TEMP_DIVIDEND
    // MINUS
    // SELECT * FROM ITEM;

    // SELECT DISTINCT ITEMNAME FROM ITEM
    // MINUS
    // SELECT DISTINCT ITEMNAME FROM INTERMEDIATE;
    // `;
    requestResult(executeQuery);
  };

  return (
    <>

      <div className={styles.container}>
        <div className="flex h-full w-full text-slate-900">
          <div className="bg-slate-200 h-full mr-3 p-2 overflow-y-scroll">
            <h1
              className={`p-12 text-3xl font-onest text-slate-950 ${
                sideMenuVisible ? "" : "hidden"
              }`}
            >
              Database Query
            </h1>
            Tables:
              <ListGroup as={"ul"}>
                {tableNames.map((tableName: any, count) => {
                  return (
                    <div className={styles.table_item} key={`${tableName.TABLE_NAME}`}>
                      <ListGroup.Item
                        key={`count${tableName}`}
                        as={"li"}
                        className="mt-2"
                        onClick={() => {
                          changeVisibleTable(tableName.TABLE_NAME);
                          setDistinct(false)
                        }}
                      >
                         <div className={styles.table_item}>{tableName.TABLE_NAME}</div>
                      </ListGroup.Item>
                    </div>
                  );
                })}
              </ListGroup>
          </div>

          <div>
          <Alert isVisible={alert.isVisible} msg={alert.msg} op_result={alert.op_result} />
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
            <div className="flex justify-center gap-2">
              <div className={styles.reset_btn}>
                <Button
                  onClick={() => {
                    changeVisibleTable(currTable);
                  }}
                  variant="outline-danger"
                >
                  Reset View
                </Button>
              </div>
              <div className={styles.reset_btn}>
                <Button onClick={handleExecuteQuery} variant="outline-primary">
                  Execute Query
                </Button>
              </div>
            </div>
            <div className="text-cyan-800">
              {currTable
                ? `Current Table: ${currTable}`
                : "Select a table to view"}
            </div>
            <div className="text-cyan-800">
              {operation ? `Current Operation: ${operation}` : null}
            </div>
            <div className={styles.table}>
              {result.length > 0 ? (
                <DataTable data={result} />
              ) : (
                <Spinner animation="border" />
              )}
            </div>
            <div className={styles.table}>
              {(() => {
                if (
                  joinTableResult.length > 0 &&
                  (operation === "JOIN" || operation === "DIVISION")
                ) {
                  return <DataTable data={joinTableResult} />;
                } else {
                  return <></>;
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
