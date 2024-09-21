import React from "react";

const TodoList = ({ todos, onRemove }) => (
	<table className="table" data-role="table">
		<tbody>
			{todos.map((todo) => (
				<tr key={todo.id}>
					<td> {todo.text}</td>
					<td>
						<button className="button alert" onClick={() => onRemove(todo.id)}>
							Remove
						</button>
					</td>
				</tr>
			))}
		</tbody>
	</table>
);

export default TodoList;
