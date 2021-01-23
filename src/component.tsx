import { values } from "d3";
import * as React from "react";

export interface State {
    data
}

export const initialState: State = {
    data: {
        columns: [],
        rows: [
        ]
    }
}

export class ReactCircleCard extends React.Component<{}, State>{

    public state: State = initialState;
    private static updateCallback: (data: object) => void = null;

    constructor(props: any) {
        super(props);
        this.state = initialState;
    }

    public static update(newState: State) {
        if (typeof ReactCircleCard.updateCallback === 'function') {
            ReactCircleCard.updateCallback(newState);
        }
    }

    public componentWillMount() {
        ReactCircleCard.updateCallback = (newState: State): void => { this.setState(newState); };
    }

    public componentWillUnmount() {
        ReactCircleCard.updateCallback = null;
    }

    private handleCellChanged(eventContext, event) {
        let value = event.target.value;
        let { rowI, colI } = eventContext;

        let rows = this.state.data.rows;
        rows[rowI][colI] = value;

        this.setState(
            {
                data: rows
            }
        );
    }

    private handleSaveBtnClick(event) {
        console.log("Click!");
    }

    private renderTableBody() {
        const colsCount = this.state.data.columns.length;
        let tableBodyJsx = [];

        for (let i = 0; i < this.state.data.rows.length; i++) {

            const row = this.state.data.rows[i];
            let rowsJsx = [];

            for (let j = 0; j < colsCount; j++) {
                const value = row[j];
                const eventContext = { rowI: i, colI: j };

                rowsJsx.push(
                    <td contentEditable="true" onChange={this.handleCellChanged.bind(this, eventContext)}>
                        {value}
                    </td>
                );
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

        for (let i = 0; i < cols.length; i++) {
            const column = cols[i];

            tableHeaderJsx.push(
                <th>{column}</th>
            )
        }

        return tableHeaderJsx;
    }


    render() {
        if (this.state.data.columns.length > 0) {
            return (
                <div>
                    <div className="flex--justify-between mb-2">
                        <span className="h2">Visual tabulky</span>
                        <button className="button" onClick={this.handleSaveBtnClick}>Save changes</button>
                    </div>
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
            )
        }
        else {
            return (
                <div>
                    <p>Přidejte data</p>
                </div>
            )
        }

    }
}

export default ReactCircleCard;