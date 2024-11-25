import { useState } from "react";
import { Button } from "./Button.tsx";
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
			<div className="flex flex-col gap-1">
				<label>Presets</label>
				<div className="flex gap-2 items-center justify-between">
					<Button
						className="basis-0 grow"
						onClick={() => setOptions(Difficulties.EASY)}
					>
						Easy
					</Button>
					<Button
						className="basis-0 grow"
						onClick={() => setOptions(Difficulties.MEDIUM)}
					>
						Medium
					</Button>
					<Button
						className="basis-0 grow"
						onClick={() => setOptions(Difficulties.HARD)}
					>
						Hard
					</Button>
					<Button
						className="basis-0 grow"
						onClick={() => setOptions(Difficulties.EXPERT)}
					>
						Expert
					</Button>
				</div>
			</div>
			<br />
			<form onSubmit={onSubmit} className="flex flex-col gap-4">
				<OptionsField
					label="Columns"
					type="number"
					value={options.width}
					min="9"
					max="100"
					onChange={setOption("width")}
				/>
				<OptionsField
					label="Rows"
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
				<div className="flex pt-4 gap-2 items-center justify-end">
					<Button onClick={onCancel}>Cancel</Button>
					<Button
						type="submit"
						disabled={options === initialOptions}
						className="enabled:bg-stone-900 enabled:text-white enabled:border-stone-900 hover:bg-stone-700"
					>
						Save & restart
					</Button>
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
		<div className="flex flex-col gap-1">
			<label>{label}</label>
			<input
				className="inline-block border border-stone-300 p-2 rounded-sm w-full"
				{...attrs}
			/>
		</div>
	);
};
