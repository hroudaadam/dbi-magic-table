import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import TableSortLabel from '@material-ui/core/TableSortLabel';
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
    showModal,
    editedRows,
    delButtVis
}

export const initialState: State = {
    data: [],
    cols: [],
    colsTypes: [],
    pkCol: null,
    delColIndex: null,
    size: 200,
    apiUrl: "",
    showModal: false,
    editedRows: [],
    delButtVis: false
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

    // editování buňky
    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, col } = eventContext;

        let data = this.state.data;
        let editRow = data[rowI];
        editRow[col] = value;

        let editedRows = this.state.editedRows;
        editedRows.push(editRow.ID);

        this.setState((prevState => ({
            data: data,
            editedRows: editedRows
        })));
    }

    // vrací index ID sloupce v poli sloupců
    private getIndexOfPkCol() {
        var cols: Array<String> = this.state.cols;
        return cols.findIndex(col => col === this.state.pkCol);
    }

    // uložení změn
    private handleSaveBtnClick(event) {
        if (this.getIndexOfPkCol() < 0) {
            return;
        }
        const data = this.state.data;
        const cols = this.state.cols;
        const colsTypes = this.state.colsTypes;

        // získání pouze editovaných řádků
        var uniqueEditRowIds = [...new Set(this.state.editedRows)];
        var bodyObj = [];
        data.map(function (row) {
            if (uniqueEditRowIds.indexOf(row.ID) >= 0) {
                bodyObj.push(row);
            }
        });

        // formátování pokud pro DateTime
        // pole indexů sloupců, které jsou typu DateTime
        let dateTypeIndexes = [];
        for (let i = 0; i < colsTypes.length; i++) {
            const colsType = colsTypes[i];
            if (colsType === "D") dateTypeIndexes.push(i);
        }
        for (let i = 0; i < bodyObj.length; i++) {
            const row = bodyObj[i];
            // upravuje pouze sloupce, které jsou DateTime
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

    private handleDelBtnClick(event) {
        this.setState((prevState => ({
            delButtVis: !prevState.delButtVis
        })));
    }

    // smazání řádky
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

    // formátování DateTime stringu na ISO string
    private formatDate(rawDate) {
        let splitDateString = rawDate.split("/");
        let day = parseInt(splitDateString[0]);
        let month = parseInt(splitDateString[1]) - 1;
        let year = parseInt(splitDateString[2]);

        let date = new Date(year, month, day);
        date.setHours(date.getHours() + 1);
        return date.toISOString();
    }

    // přidání řádky
    private handleNewBtnClick(event) {
        const data = this.state.data;
        const cols = this.state.cols;

        let newObj = {
        };

        newObj[this.state.pkCol] = -1

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

        // pro každou řádku
        for (let i = 0; i < data.length; i++) {

            const row = data[i];
            let rowsJsx = [];

            // skrýt pokud je smazaný
            if (row["DEL"]) {
                continue;
            }

            // buňka pro talčítko smazání
            if (this.state.delButtVis) {
                rowsJsx.push(
                    <TableCell padding="none">
                        <IconButton>
                            <DeleteIcon fontSize="small" onClick={this.handleDelRowBtnClick.bind(this, i)} />
                        </IconButton>
                    </TableCell>
                );
            }

            // pro každou její buňku
            for (let j = 0; j < cols.length; j++) {
                // pokud se nejedná o buňku s ID
                if (j != pkColIndex && j != delColIndex) {
                    var col = cols[j];
                    var value = row[col];

                    const eventContext = { rowI: i, col: col };

                    rowsJsx.push(
                        <TableCell >
                            <Input disableUnderline={true} multiline={true} value={value} onChange={this.handleCellChanged.bind(this, eventContext)} />
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

        // sloupec na mazání

        if (this.state.delButtVis) {
            tableHeaderJsx.push(
                <TableCell
                    key={-1}
                >
                    {""}
                </TableCell>
            )
        }

        // ostatní sloupce
        for (let i = 0; i < cols.length; i++) {

            if (i != pkColIndex && i != delColIndex) {
                const column = cols[i];

                tableHeaderJsx.push(
                    <TableCell
                        key={i}
                    >
                        {column}
                    </TableCell>
                )
            }
        }
        return tableHeaderJsx;
    }


    render() {
        const sizeStyle = { height: this.state.size };
        const cols = this.state.cols;
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
                <TableContainer component={Paper} style={sizeStyle}>
                    <Table stickyHeader size="small" aria-label="a dense table">
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
            </div>
        )
    }
}

export default ReactCircleCard;