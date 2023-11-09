import Table from "react-bootstrap/Table";

interface DataTableProps {
  data: Array<Record<string, any>>;
}

const DataTable = ({data}: DataTableProps) => {

  if (!data || data.length === 0) {
    return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>No results</th>
        </tr>
      </thead>
    </Table>
    );
  }

  const keys = Object.keys(data[0]);

  const populateTable = () => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      let values = Object.values(data[i]);
      let items = [];
      for (let j = 0; j < values.length; j++) {
        items.push(<td>{values[j]}</td>);
      }
      result.push(items);
    }
    return result.map((obj, index) => {
      return <tr key={index}>{...obj}</tr>;
    });
  };


  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          {keys.map((obj, index) => {
            return <th key={index}>{obj}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {populateTable()}
      </tbody>
    </Table>
  );
};
export default DataTable;
