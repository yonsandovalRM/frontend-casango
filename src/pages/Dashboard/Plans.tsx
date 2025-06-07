import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { Plan } from '../../interfaces/plans';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import { Card } from '../../components/ui/card/Card';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { toast } from 'react-toastify';
import Alert from '../../components/ui/alert/Alert';
import * as yup from 'yup';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Label from '../../components/form/Label';
import { Modal } from '../../components/ui/modal';

const ListFeatures = ({ items }: { items: string[] }) => {
	return (
		<ul className='list-disc list-inside'>
			{items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
};

const ActionsButton = () => {
	return (
		<div className='flex justify-end gap-2'>
			<Button variant='primary'>Editar</Button>
			<Button variant='primary'>Eliminar</Button>
		</div>
	);
};

interface IFormInputs {
	name: string;
	description: string;
	price: number;
	features: string[];
}

const planSchema = yup
	.object({
		name: yup.string().required('Este campo es requerido'),
		description: yup.string().required('Este campo es requerido'),
		price: yup.number().required('Este campo es requerido'),
		features: yup.array().of(yup.string()).required('Este campo es requerido'),
	})
	.required();

const PlanCard = ({ plan }: { plan: Plan }) => {
	return <Card>{plan.name}</Card>;
};

export const Plans = () => {
	const [errors, setErrors] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [tempFeature, setTempFeature] = useState('');
	const { api } = useAxiosPrivate();
	const queryClient = useQueryClient();

	const { handleSubmit, control, reset, setValue, watch } = useForm({
		resolver: yupResolver(planSchema),
		defaultValues: {
			name: '',
			description: '',
			price: 0,
			features: [],
		},
	});

	const features = watch('features');

	const handleAddFeature = () => {
		if (tempFeature.trim()) {
			setValue('features', [...features, tempFeature.trim()]);
			setTempFeature('');
		}
	};

	const handleRemoveFeature = (index: number) => {
		const newFeatures = features.filter((_, i) => i !== index);
		setValue('features', newFeatures);
	};

	const {
		isPending,
		error,
		data: plans,
	} = useQuery<Plan[]>({
		queryKey: ['plans'],
		queryFn: () => api.get('/core/plans').then((res) => res.data),
	});
	console.log({ plans });
	const mutation = useMutation({
		mutationFn: (newPlan: Partial<Plan>) => {
			return api.post('/core/plans', newPlan);
		},
		onError: (error: any, variables, context) => {
			console.log({ error: error.response?.data.message });
			setErrors(error.response?.data.message);
			toast.error('Error al crear el plan');
		},
		onSuccess: (data, variables, context) => {
			toast.success('Plan creado correctamente');
			setErrors([]);
			queryClient.invalidateQueries({ queryKey: ['plans'] });
		},
	});

	const onSubmit = async (data: any) => {
		mutation.mutate(data);
	};

	if (isPending) return <div>Cargando...</div>;

	return (
		<>
			<PageMeta title='Planes' description='Planes de la aplicación' />
			<PageBreadcrumb pageTitle='Planes' />

			<div className='flex justify-between items-center mb-4'>
				<Input type='text' placeholder='Buscar plan' />
				<Button variant='primary' onClick={() => setIsOpen(true)}>
					Crear plan
				</Button>
			</div>

			<Modal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				className='w-full max-w-2xl'
			>
				<div>
					<h1>Crear plan</h1>
				</div>
				{errors.length > 0 && (
					<Alert variant='error' title='Error' message={errors.join(', ')} />
				)}

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='space-y-6'>
						<div>
							<Label required>Nombre</Label>
							<Controller
								control={control}
								name='name'
								render={({ field, fieldState: { error } }) => (
									<Input
										{...field}
										placeholder='Nombre'
										error={!!error}
										hint={error?.message}
										autoComplete='off'
									/>
								)}
							/>
						</div>
						<div>
							<Label required>Descripción</Label>
							<Controller
								control={control}
								name='description'
								render={({ field, fieldState: { error } }) => (
									<Input
										{...field}
										placeholder='Descripción'
										error={!!error}
										hint={error?.message}
										autoComplete='off'
									/>
								)}
							/>
						</div>
						<div>
							<Label required>Precio</Label>
							<Controller
								control={control}
								name='price'
								render={({ field, fieldState: { error } }) => (
									<Input
										{...field}
										placeholder='Precio'
										error={!!error}
										hint={error?.message}
										autoComplete='off'
									/>
								)}
							/>
						</div>
						<div>
							<Label required>Características</Label>
							<div className='space-y-2'>
								<div className='flex gap-2'>
									<Input
										type='text'
										placeholder='Agregar característica'
										value={tempFeature}
										onChange={(e) => setTempFeature(e.target.value)}
									/>
									<Button
										type='button'
										variant='primary'
										onClick={handleAddFeature}
									>
										Agregar
									</Button>
								</div>
								<div className='space-y-2'>
									{features.map((feature, index) => (
										<div
											key={index}
											className='flex items-center gap-2 bg-gray-100 p-2 rounded'
										>
											<span>{feature}</span>
											<button
												type='button'
												onClick={() => handleRemoveFeature(index)}
												className='text-red-500 hover:text-red-700'
											>
												eliminar
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
						<Button type='submit' variant='primary'>
							Crear plan
						</Button>
					</div>
				</form>
			</Modal>

			<pre>{JSON.stringify(plans, null, 2)}</pre>
		</>
	);
};
