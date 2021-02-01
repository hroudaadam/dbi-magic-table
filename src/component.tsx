import * as React from "react";
import { Button, Modal } from 'react-bootstrap';

export interface State {
    data,
    size,
    apiUrl,
    showModal,
    editedRows
}

export const initialState: State = {
    data: {
        columns: [],
        rows: []
    },
    size: 200,
    apiUrl: "",
    showModal: false,
    editedRows: []
}

export class ReactCircleCard extends React.Component<{}, State>{

    public state: State = initialState;
    private static updateCallback: (data: object) => void = null;

    constructor(props: any) {
        super(props);
        this.state = initialState;
        this.handleSaveBtnClick = this.handleSaveBtnClick.bind(this);
        this.handleNewBtnClick = this.handleNewBtnClick.bind(this);
        this.handleOpenCloseModal = this.handleOpenCloseModal.bind(this);
    }

    public static update(newState: State) {
        if (typeof ReactCircleCard.updateCallback === 'function') {
            ReactCircleCard.updateCallback(newState);
        }
        console.log("update");
    }

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => { this.setState(newState); };
        this.transformBody();
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, colI } = eventContext;

        let rows = this.state.data.rows;
        rows[rowI][colI] = value;


        let editedRows = this.state.editedRows;
        editedRows.push(rows[rowI].ID);
        console.log(rows[rowI][0]);

        this.setState((prevState => ({
            data: {
                columns: prevState.data.columns,
                rows: prevState.data.rows
            },
            editedRows: editedRows
        })));
    }

    private getIndexOfPkCol() {
        var cols: Array<String> = this.state.data.columns;
        return cols.findIndex(col => col === "ID");
    }

    private handleOpenCloseModal() {
        this.setState((prevState => ({
            showModal: !prevState.showModal
        })));
    }

    private handleSaveBtnClick(event) {
        if (this.getIndexOfPkCol() < 0) {
            return;
        }

        
        var uniqueRows = [...new Set(this.state.editedRows)];
        console.log("prdel");
        console.log(uniqueRows);

        // var url = "https://prod-140.westeurope.logic.azure.com:443/workflows/101633d73f5447d2b60a837670fdbadc/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=3B_Oq59FZuJVXG8nq3k4pHLgTn64p6i7FlUwTTNQIsw";
        var url = this.state.apiUrl;
        var body = JSON.stringify(this.transformBody());

        fetch(url, {
            method: "POST",
            body: body
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

        console.log(body);
        console.log(url);
    }

    private handleNewBtnClick(event) {
        var rows = this.state.data.rows;
        var cols = this.state.data.columns;
        var newObj: (string | number)[] = [-1];

        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            if (col !== "ID") {
                newObj.push("");
            }
        }

        rows.unshift(newObj);

        this.setState((prevState => ({
            data: {
                columns: prevState.data.columns,
                rows: rows
            },
        })));
    }

    private transformBody() {
        var newBody = [];
        const rows = this.state.data.rows;
        const cols = this.state.data.columns;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            let newObjectRow = {};

            for (let j = 0; j < cols.length; j++) {
                const col = cols[j];
                newObjectRow[col] = row[j];
            }
            newBody.push(newObjectRow);
        }
        return newBody;
    }

    private renderTableBody() {
        const colsCount = this.state.data.columns.length;
        let tableBodyJsx = [];
        const pkColIndex = this.getIndexOfPkCol();

        // pro každou řádku
        for (let i = 0; i < this.state.data.rows.length; i++) {

            const row = this.state.data.rows[i];
            let rowsJsx = [];

            // pro každou její buňku
            for (let j = 0; j < colsCount; j++) {
                // pokud se nejedná o buňku s ID
                if (pkColIndex != j) {
                    var value = row[j];

                    const eventContext = { rowI: i, colI: j };

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
        const cols = this.state.data.columns;
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

        if (this.state.data.columns.length > 0) {
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