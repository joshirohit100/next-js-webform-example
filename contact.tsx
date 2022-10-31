import {Layout, LayoutProps} from "../components/layout";
import {GetStaticPropsResult} from "next";
import {getMenus} from "../lib/get-menus";

interface DrupalWebFormField {
    title: string
    type: string
    name: string
    id: string
    required: boolean
}

interface ContactUsFormPageProps extends LayoutProps {
    webFormFields: DrupalWebFormField[];
}

export default function ContactusFormPage({ menus, webFormFields }: ContactUsFormPageProps) {
    const formFields = [];
    {webFormFields.map((webFormField) => (
        formFields.push(FormField(webFormField))
    ))}

    return(
        <Layout title="Home" menus={menus}>
            <form onSubmit={formSubmitHandler}>
                { formFields }
                <button className={"block bg-teal hover:bg-teal-dark uppercase text-lg mx-auto p-4 rounded"} type="submit">Submit</button>
            </form>
        </Layout>
    );
}

const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e.target);
    console.log(e.currentTarget.elements);
}

const FormField = ( webFormField: DrupalWebFormField ) => {
    return(
        <div className={"flex flex-col mb-2"} key={webFormField.id}>
            <label className={"block w-full"} htmlFor={webFormField.name}>{webFormField.title}</label>
            <input className="border text-grey-darkest" name={webFormField.id} type={webFormField.type} required={webFormField.required} />
        </div>
    );
}

export async function getStaticProps( context ): Promise<GetStaticPropsResult<ContactUsFormPageProps>> {
    // Get the web-form fields.
    const response = await fetch(`${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/webform_rest/contact/fields?_format=json`);
    // Parse the response.
    const webFormFieldsJsonResponse = await response.json();

    // Prepare the field data..
    let webFormFields = [];
    Object.entries(webFormFieldsJsonResponse).forEach(([key, value]) => {
        // Ignore action button.
        if (value['#type'] === 'webform_actions') {
            return;
        }

        const webfFormField: DrupalWebFormField = {
            title: value['#title'],
            type: value['#type'],
            name: key,
            id: value['#webform_id'],
            required: value['#required'],
        };
        webFormFields.push(webfFormField);
    });

    return {
        props: {
            menus: await getMenus(context),
            webFormFields: webFormFields,
        },
        revalidate: 60
    };
}
