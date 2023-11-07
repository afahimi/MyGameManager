<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

$success = True; //keep track of errors so it redirects the page only if there are no errors
$db_conn = NULL; // edit the login credentials in connectToDB()
$show_debug_alert_messages = False; // set to True if you want alerts to show you which methods are being triggered (see how it is used in debugAlertMessage())

function connectToDB() {
    global $db_conn;

    // Your username is ora_(CWL_ID) and the password is a(student number). For example,
    // ora_platypus is the username and a12345678 is the password.
    $db_conn = OCILogon("ora_afahimi", "a13006549", "dbhost.students.cs.ubc.ca:1522/stu");

    if ($db_conn) {
        return true;
    } else {
        $e = OCI_Error(); // For OCILogon errors pass no handle
        return false;
    }
}

function disconnectFromDB() {
    global $db_conn;

    OCILogoff($db_conn);
}

function executePlainSQL($cmdstr) { //takes a plain (no bound variables) SQL command and executes it
    //echo "<br>running ".$cmdstr."<br>";
    global $db_conn, $success;

    $statement = OCIParse($db_conn, (string)$cmdstr);
    //There are a set of comments at the end of the file that describe some of the OCI specific functions and how they work

    if (!$statement) {
        $e = OCI_Error($db_conn); // For OCIParse errors pass the connection handle
        echo htmlentities($e['message']);
        $success = False;
    }

    $r = OCIExecute($statement, OCI_DEFAULT);
    if (!$r) {
        $e = oci_error($statement); // For OCIExecute errors pass the statementhandle
        $success = False;
    }

    return $statement;
}

function handleQueryRequest($query) {
    global $db_conn;

    $statement = executePlainSQL($query);

    $result = array(
        "test" => "Received content",
        "content" => $query
    );
    echo json_encode($result);

    // $result = array();
    // array_push($result, "test", $query);
    // echo json_encode($result);

    // global $success;
    // if(!$success) {
    //     $result = array();
    //     array_push($result, "test", "fail");
    //     echo json_encode($result);
    //     return;
    // }

    // $data = array();
    // while ($row = oci_fetch_assoc($statement)) {
    //     array_push($data, $row);
    // }

    // oci_free_statement($statement);
    // header('Content-Type: application/json');
    // echo json_encode($data);
}

connectToDB();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = file_get_contents("php://input");
    $decodedContent = json_decode($content, true);
    handleQueryRequest($decodedcontent[$query]);
    // $result = array(
    //     "test" => "Received content",
    //     "content" => $decodedContent["query"]
    // );
    // echo json_encode($result);
}
disconnectFromDB();