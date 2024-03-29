import { useContext } from 'react'
import { Collapse, Container, Stack } from 'react-bootstrap'
import { constants } from '~/config'
import { useDisclosure } from '~/hooks'
import { Table } from '~/components'
import { ErrorModal, Filters, Header, Navbar } from './components'
import { GetUsersContext, GetUsersProvider } from './context'

const columns: TableColumns = [
	{
		id: 'name',
		label: 'Nombre',
		sortable: true,
		minWidth: 180
	},
	{
		id: 'gender',
		label: 'Género',
		sortable: true,
		minWidth: 100,
		tdClassName: 'text-capitalize'
	},
	{
		id: 'email',
		label: 'Correo electrónico',
		sortable: true,
		minWidth: 150
	},
	{
		id: 'cell',
		label: 'Celular',
		sortable: true,
		minWidth: 150
	},
	{
		id: 'nat',
		label: 'Nacionalidad',
		sortable: true,
		minWidth: 140
	}
]

const Main = () => {
	const {
		loadingUsers,
		page,
		updatePage,
		updateResults,
		users,
		selectUser,
		selectAllUsers,
		selectedUserIDs,
		usersTableMode,
		handleUserInputsChange
	} = useContext(GetUsersContext) as TGetUsersContext
	const { open: expandedFilters, onToggle: toggleExpandedFilters } =
		useDisclosure()

	return (
		<>
			<Navbar
				logoAlt={constants.BRAND_NAME}
				logoSrc={constants.BRAND_LOGO_SRC}
			/>
			<Container className='pt-5'>
				<Stack gap={4}>
					<Header toggleExpandedFilters={toggleExpandedFilters} />
					<Collapse in={expandedFilters}>
						{/*
							wrap Filters component in a div for smooth animation purposes
							Ref: https://react-bootstrap.netlify.app/docs/utilities/transitions#horizontal 
						*/}
						<div>
							<Filters />
						</div>
					</Collapse>
					<Table<User>
						mode={usersTableMode}
						enablePagination
						loadingData={loadingUsers}
						data={users}
						columns={columns}
						page={page}
						updatePage={updatePage}
						updateResults={updateResults}
						selectItem={selectUser}
						selectAllItems={selectAllUsers}
						selectedItemIDs={selectedUserIDs}
						onItemInputsChange={handleUserInputsChange}
					/>
				</Stack>
			</Container>
			<ErrorModal defaultMessage='Ocurrió un error al obtener los usuarios' />
		</>
	)
}

const MainWithContext = () => (
	<GetUsersProvider>
		<Main />
	</GetUsersProvider>
)

export default MainWithContext
