
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import Dashboard from "@/components/Dashboard";
export default function Home() {
	return (
		<PrimeReactProvider>
			<Dashboard />
		</PrimeReactProvider>

	);
}
