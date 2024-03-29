import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { FC, PropsWithChildren, createContext, useState } from 'react'
import { constants } from '~/config'
import { useDisclosure } from '~/hooks'
import { getUsers } from '~/network'

export const GetUsersContext = createContext<TGetUsersContext | null>(null)

type GetUsersProviderProps = PropsWithChildren

export const GetUsersProvider: FC<GetUsersProviderProps> = props => {
	const { children } = props
	const {
		open: errorModalOpened,
		onOpen: openErrorModal,
		onClose: closeErrorModal
	} = useDisclosure()
	const [errorUserMessage, setErrorUserMessage] = useState<string>()
	const [searchParams, setSearchParams] = useState<Required<GetUsersParams>>({
		page: '1',
		results: constants.PAGE_SIZES[0],
		gender: constants.GENDERS[0],
		nat: constants.NATIONALITIES[0]
	})
	const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([])
	const [editableUsers, setEditableUsers] = useState<Record<string, User>>({})
	const [usersTableMode, setUsersTableMode] = useState<TableMode>('read')
	const editableUsersAsArray = Object.values(editableUsers)
	const { isLoading: loadingUsers } = useQuery({
		queryKey: [
			'getUsers',
			searchParams.page,
			searchParams.results,
			searchParams.gender,
			searchParams.nat
		],
		queryFn: async ({ queryKey }) => {
			try {
				const users = await getUsers({
					page: queryKey[1],
					results: queryKey[2],
					gender: queryKey[3] !== 'all' ? queryKey[3] : undefined,
					nat: queryKey[4] !== 'all' ? queryKey[4] : undefined
				})

				setEditableUsers(
					users.reduce<Record<string, User>>((result, user) => {
						result[user.id] = user
						return result
					}, {})
				)
				return users
			} catch (error) {
				let message

				if (error instanceof AxiosError)
					message = (error.response?.data as ApiErrorResponse).error
				else if (error instanceof Error) message = error.message

				setErrorUserMessage(message)
				openErrorModal()
				return null
			}
		},
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData
	})

	const updateSearchParams = (key: keyof GetUsersParams, value: string) => {
		setSelectedUserIDs([])
		setSearchParams(previousSearchParams => ({
			...previousSearchParams,
			[key]: value
		}))
	}

	const updatePage: TGetUsersContext['updatePage'] = page =>
		updateSearchParams('page', page)

	const updateResults: TGetUsersContext['updateResults'] = results =>
		updateSearchParams('results', results)

	const updateGender: TGetUsersContext['updateGender'] = gender =>
		updateSearchParams('gender', gender)

	const updateNat: TGetUsersContext['updateNat'] = nat =>
		updateSearchParams('nat', nat)

	const selectUser: TGetUsersContext['selectUser'] = user => {
		const isSelected = selectedUserIDs.includes(user.id)
		let newSelectedUserIDs: string[] = []

		if (isSelected)
			newSelectedUserIDs = selectedUserIDs.filter(id => id !== user.id)
		else newSelectedUserIDs = selectedUserIDs.concat(user.id)

		setSelectedUserIDs(newSelectedUserIDs)
	}

	const selectAllUsers = () => {
		let newSelectedUserIDs: string[] = []

		if (selectedUserIDs.length !== editableUsersAsArray.length)
			newSelectedUserIDs = editableUsersAsArray.map(user => user.id)

		setSelectedUserIDs(newSelectedUserIDs)
	}

	const removeUsers = () => {
		const newEditableUsers = { ...editableUsers }

		for (const userID of selectedUserIDs) {
			delete newEditableUsers[userID]
		}

		setEditableUsers(newEditableUsers)
		setSelectedUserIDs([])
	}

	const updateUsersTableMode: TGetUsersContext['updateUsersTableMode'] = mode =>
		setUsersTableMode(mode)

	const handleUserInputsChange: TGetUsersContext['handleUserInputsChange'] = (
		user,
		key,
		value
	) =>
		setEditableUsers(editableUsers => ({
			...editableUsers,
			[user.id]: {
				...editableUsers[user.id],
				[key]: value
			}
		}))

	return (
		<GetUsersContext.Provider
			value={{
				...searchParams,
				updatePage,
				updateResults,
				updateGender,
				updateNat,
				users: editableUsersAsArray,
				loadingUsers,
				selectUser,
				selectAllUsers,
				selectedUserIDs,
				removeUsers,
				usersTableMode,
				updateUsersTableMode,
				handleUserInputsChange,
				errorModalOpened,
				closeErrorModal,
				errorUserMessage
			}}
		>
			{children}
		</GetUsersContext.Provider>
	)
}
