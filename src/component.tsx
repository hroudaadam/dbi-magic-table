import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

export interface State {
    data,
    cols,
    colsTypes,
    pkCol,
    delColIndex,
    size,
    apiUrl,
    editedRows,
    delButtVis,
    fontSize
}

export const initialState: State = {
    data: [],
    cols: [],
    colsTypes: [],
    pkCol: null,
    delColIndex: null,
    size: 200,
    apiUrl: "",
    editedRows: [],
    delButtVis: false,
    fontSize: 12
}

export class ReactCircleCard extends React.Component<{}, State>{

    public state: State = initialState;
    private static updateCallback: (data: object) => void = null;

    constructor(props: any) {
        super(props);
        this.state = initialState;

        // binding
        this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
        this.handleNewBtnClick = this.handleNewBtnClick.bind(this);
        this.handleDelBtnClick = this.handleDelBtnClick.bind(this);
    }

    public static update(newState: State) {
        if (typeof ReactCircleCard.updateCallback === 'function') {
            ReactCircleCard.updateCallback(newState);
        }
    }

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => {
            this.setState(newState);
        };
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    // cell edit value
    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, col } = eventContext;
        
        // edit value in store object
        let data = this.state.data;
        let editRow = data[rowI];
        editRow[col] = value;

        // add record of row that has been edited 
        let editedRows = this.state.editedRows;
        editedRows.push(editRow.ID);

        this.setState((prevState => ({
            data: data,
            editedRows: editedRows
        })));
    }

    // returns index of ID column in columns array
    private getIndexOfPkCol() {
        var cols: Array<String> = this.state.cols;
        return cols.findIndex(col => col === this.state.pkCol);
    }

    // save changes
    private handleSaveBtnClick(event) {
        if (this.getIndexOfPkCol() < 0) {
            return;
        }
        const data = this.state.data;
        const cols = this.state.cols;
        const colsTypes = this.state.colsTypes;

        // getting only edited rows
        var uniqueEditRowIds = [...new Set(this.state.editedRows)];
        var bodyObj = [];
        data.map(function (row) {
            if (uniqueEditRowIds.indexOf(row.ID) >= 0) {
                bodyObj.push(row);
            }
        });

        // format cell if it is datetime
        // indexes of columns that are datetime
        let dateTypeIndexes = [];
        for (let i = 0; i < colsTypes.length; i++) {
            const colsType = colsTypes[i];
            if (colsType === "D") dateTypeIndexes.push(i);
        }
        for (let i = 0; i < bodyObj.length; i++) {
            const row = bodyObj[i];
            // edits only columns that are datetime
            for (let j = 0; j < dateTypeIndexes.length; j++) {
                const dateTypeIndex = dateTypeIndexes[j];
                row[cols[dateTypeIndex]] = this.formatDate(row[cols[dateTypeIndex]]);
            }
        }

        // "https://prod-140.westeurope.logic.azure.com:443/workflows/101633d73f5447d2b60a837670fdbadc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3B_Oq59FZuJVXG8nq3k4pHLgTn64p6i7FlUwTTNQIsw";
        var url = this.state.apiUrl;
        var bodyStr = JSON.stringify(bodyObj);
        console.log(bodyStr);

        fetch(url, {
            method: "POST",
            body: bodyStr
        })
            .then((resp) => {
                resp.text();
            })
            .then((text) => {
                console.log("response: " + text);
            })
            .catch((err) => {
                console.error("error: " + err);
            });
    }

    // show/hide delete buttons
    private handleDelBtnClick(event) {
        this.setState((prevState => ({
            delButtVis: !prevState.delButtVis
        })));
    }

    // delete row
    private handleDelRowBtnClick(rowIndex, event) {
        let data = this.state.data;
        let deleteRow = data[rowIndex];
        deleteRow["DEL"] = true;

        let editedRows = this.state.editedRows;
        editedRows.push(deleteRow.ID);

        this.setState((prevState => ({
            data: data,
            editedRows: editedRows
        })));
    }

    // format datetime string to ISO string
    private formatDate(rawDate) {
        if (rawDate) {
            let splitDateString = rawDate.split("/");
            let day = parseInt(splitDateString[0]);
            let month = parseInt(splitDateString[1]) - 1;
            let year = parseInt(splitDateString[2]);

            let date = new Date(year, month, day);
            date.setHours(date.getHours() + 1);
            return date.toISOString();
        }
        return "";
    }

    // add new row
    private handleNewBtnClick(event) {
        const data = this.state.data;
        const cols = this.state.cols;

        let newObj = {
        };

        newObj[this.state.pkCol] = -1;
        newObj["DEL"] = false;

        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            if (col !== this.state.pkCol) {
                newObj[col] = "";
            }
        }

        data.unshift(newObj);

        this.setState((prevState => ({
            data: data
        })));
    }

    private renderTableBody() {
        let cols = this.state.cols;
        let data = this.state.data;
        const pkColIndex = this.getIndexOfPkCol();
        const delColIndex = this.state.delColIndex;
        let tableBodyJsx = [];
        const fontSize = {fontSize: `${this.state.fontSize}px`};

        // for each row
        for (let i = 0; i < data.length; i++) {

            const row = data[i];
            let rowsJsx = [];

            // hide if row is deleted
            if (row["DEL"]) {
                continue;
            }

            // cell for delete button
            if (this.state.delButtVis) {
                rowsJsx.push(
                    <TableCell padding="none">
                        <IconButton>
                            <DeleteIcon fontSize="small" onClick={this.handleDelRowBtnClick.bind(this, i)} />
                        </IconButton>
                    </TableCell>
                );
            }

            // for each cell
            for (let j = 0; j < cols.length; j++) {
                // if it is not ID cell
                if (j != pkColIndex && j != delColIndex) {
                    var col = cols[j];
                    var value = row[col];

                    const eventContext = { rowI: i, col: col };

                    rowsJsx.push(
                        <TableCell >
                            <Input style={fontSize} disableUnderline={true} multiline={true} value={value} onChange={this.handleCellChanged.bind(this, eventContext)} />
                        </TableCell>
                    );
                }
            }

            tableBodyJsx.push(
                <TableRow key={"row-" + i}>
                    {rowsJsx}
                </TableRow>
            );
        }
        return tableBodyJsx;
    }

    private renderTableHeader() {
        let tableHeaderJsx = [];
        const cols = this.state.cols;
        const pkColIndex = this.getIndexOfPkCol();
        const delColIndex = this.state.delColIndex;
        const fontSize = {fontSize: `${this.state.fontSize + 2}px`};

        // column for delete buttons
        if (this.state.delButtVis) {
            tableHeaderJsx.push(
                <TableCell
                    key={-1}
                >
                    {""}
                </TableCell>
            )
        }

        // other columns
        for (let i = 0; i < cols.length; i++) {

            if (i != pkColIndex && i != delColIndex) {
                const column = cols[i];

                tableHeaderJsx.push(
                    <TableCell
                        key={i}
                        style={fontSize}
                    >
                        {column}
                    </TableCell>
                )
            }
        }
        return tableHeaderJsx;
    }


    render() {
        const container = { height: this.state.size };
        const delButtonText = this.state.delButtVis ? "Hide" : "Delete";

        return (
            <div>
                 <div className="flex--justify-right mb-2">
                     <Box mr={1}>
                         <Button size="small" disableElevation variant="contained" onClick={this.handleNewBtnClick}>Add</Button>
                     </Box>
                     <Box mr={1}>
                         <Button size="small" disableElevation variant="contained" onClick={this.handleDelBtnClick}>{delButtonText}</Button>
                     </Box>
                     <Box>
                         <Button size="small" disableElevation variant="contained" onClick={this.handleSaveBtnClick}>Save</Button>
                     </Box>
                 </div>
                <Paper className="mui-paper">
                    <TableContainer style={container} className="mui-table-container">
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {this.renderTableHeader()}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.renderTableBody()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </div>
        )
    }
}

export default ReactCircleCard;