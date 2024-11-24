import { useState } from "react";
import Difficulties from "./Difficulties.ts";
import { type MinefieldOptions } from "./Minefield.ts";
import { Modal } from "./Modal.tsx";

export type OptionsProps = {
	initialOptions: MinefieldOptions;
	onCancel: () => void;
	updateOptions: (options: MinefieldOptions) => void;
};

type Option = keyof MinefieldOptions;

export const Options: React.FC<OptionsProps> = ({
	initialOptions,
	onCancel,
	updateOptions,
}) => {
	const [options, setOptions] = useState(initialOptions);

	const setOption =
		(option: Option) => (event: React.ChangeEvent<HTMLInputElement>) => {
			setOptions((options) => ({
				...options,
				[option]: parseInt(event.target.value),
			}));
		};

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		updateOptions(options);
	};

	return (
		<Modal onBlur={onCancel}>
			<div className="flex gap-2 items-center justify-between">
				<button
					className="basis-0 grow"
					onClick={() => setOptions(Difficulties.EASY)}
				>
					Easy
				</button>
				<button
					className="basis-0 grow"
					onClick={() => setOptions(Difficulties.MEDIUM)}
				>
					Medium
				</button>
				<button
					className="basis-0 grow"
					onClick={() => setOptions(Difficulties.HARD)}
				>
					Hard
				</button>
				<button
					className="basis-0 grow"
					onClick={() => setOptions(Difficulties.EXPERT)}
				>
					Expert
				</button>
			</div>
			<br />
			<form onSubmit={onSubmit}>
				<OptionsField
					label="Rows"
					type="number"
					value={options.width}
					min="9"
					max="100"
					onChange={setOption("width")}
				/>
				<OptionsField
					label="Columns"
					type="number"
					value={options.height}
					min="9"
					max="100"
					onChange={setOption("height")}
				/>
				<OptionsField
					label="Mines"
					type="number"
					value={options.mines}
					min="9"
					max={(options.width * options.height) / 2}
					onChange={setOption("mines")}
				/>
				<div className="flex gap-2 items-center justify-end">
					<button type="button" onClick={onCancel}>
						Cancel
					</button>
					<button>Save & restart</button>
				</div>
			</form>
		</Modal>
	);
};

type OptionsFieldProps = JSX.IntrinsicElements["input"] & {
	label: string;
};

const OptionsField: React.FC<OptionsFieldProps> = ({ label, ...attrs }) => {
	return (
		<>
			<label>{label}</label>
			<input {...attrs} />
		</>
	);
};
