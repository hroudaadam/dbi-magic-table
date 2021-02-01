import * as React from "react";
import { Button, Modal } from 'react-bootstrap';

export interface State {
    rawData,
    data,
    size,
    apiUrl,
    showModal,
    editedRows
}

export const initialState: State = {
    rawData: {
        columns: [],
        rows: []
    },
    data: [],
    size: 200,
    apiUrl: "",
    showModal: false,
    editedRows: [],
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
    }

    public static update(newState: State) {
        if (typeof ReactCircleCard.updateCallback === 'function') {
            ReactCircleCard.updateCallback(newState);
        }

    }

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => { 
            this.setState(newState); 
            this.transformBody();
        };
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    // handler pro editování buňky
    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, colKey } = eventContext;

        let data = this.state.data;
        let editRow = data[rowI];
        data[rowI][colKey] = value;

        let editedRows = this.state.editedRows;
        editedRows.push(editRow.ID);

        this.setState((prevState => ({
            data: data,
            editedRows: editedRows
        })));
    }

    private getIndexOfPkCol() {
        var cols: Array<String> = this.state.rawData.columns;
        return cols.findIndex(col => col === "ID");
    }

    private handleSaveBtnClick(event) {
        if (this.getIndexOfPkCol() < 0) {
            return;
        }
        
        var uniqueEditRowIds = [...new Set(this.state.editedRows)];
        var data = this.state.data;

        var bodyObj = [];        
        data.map(function(row){
            if (uniqueEditRowIds.indexOf(row.ID) >= 0) {
                bodyObj.push(row);
            }
        });            
        
        // "https://prod-140.westeurope.logic.azure.com:443/workflows/101633d73f5447d2b60a837670fdbadc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3B_Oq59FZuJVXG8nq3k4pHLgTn64p6i7FlUwTTNQIsw";
        var url = this.state.apiUrl;
        var bodyStr = JSON.stringify(bodyObj);
        
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

    private handleNewBtnClick(event) {
        var rows = this.state.rawData.rows;
        var cols = this.state.rawData.columns;
        var newObj: (string | number)[] = [-1];

        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            if (col !== "ID") {
                newObj.push("");
            }
        }

        rows.unshift(newObj);

        this.setState((prevState => ({
            rawData: {
                columns: prevState.rawData.columns,
                rows: rows
            },
        })));
    }

    private transformBody() {
        var formattedData = [];
        const rows = this.state.rawData.rows;
        const cols = this.state.rawData.columns;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let newRowObject = {};

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                newRowObject[col] = row[j];
            }
            formattedData.push(newRowObject);
        }
        
        this.setState({
            data: formattedData
        });  
    }

    private renderTableBody() {
        const colsCount = this.state.rawData.columns.length;
        let tableBodyJsx = [];
        const pkColIndex = this.getIndexOfPkCol();

        // pro každou řádku
        for (let i = 0; i < this.state.data.length; i++) {

            const row = this.state.data[i];
            let rowsJsx = [];

            // pro každou její buňku
            for (let j = 0; j < colsCount; j++) {
                // pokud se nejedná o buňku s ID
                if (pkColIndex != j) {
                    var colKey = Object.keys(row)[j];
                    var value = row[colKey];

                    const eventContext = { rowI: i, colKey: colKey };

                    rowsJsx.push(
                        <td >
                            <input className="input-cell" type="text" value={value} onChange={this.handleCellChanged.bind(this, eventContext)} />
                        </td>
                    );
                }

            }

            tableBodyJsx.push(
                <tr key={"row-" + i}>
                    {rowsJsx}
                </tr>
            );
        }
        return tableBodyJsx;
    }

    private renderTableHeader() {
        let tableHeaderJsx = [];
        const cols = this.state.rawData.columns;
        const pkColIndex = this.getIndexOfPkCol();

        for (let i = 0; i < cols.length; i++) {

            if (pkColIndex != i) {
                const column = cols[i];

                tableHeaderJsx.push(
                    <th>{column}</th>
                )
            }

        }
        return tableHeaderJsx;
    }


    render() {
        const sizeStyle = { height: this.state.size };

        if (this.state.rawData.columns.length > 0) {
            return (
                <div>
                    <div className="flex--justify-right mb-2">
                        <button className="button" onClick={this.handleNewBtnClick}>New entry</button>
                        <button className="button" onClick={this.handleSaveBtnClick}>Save changes</button>
                    </div>
                    <div className="table-scroll" style={sizeStyle}>
                        <table>
                            <thead>
                                <tr>
                                    {this.renderTableHeader()}
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTableBody()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="error-block">
                    <span>Nejsou k dispozici žádná data</span>
                </div>
            )
        }

    }
}

export default ReactCircleCard;