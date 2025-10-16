import { APP_NAME } from "@/lib/constants";
const Footer = () => {
    const cuurrentYear = new Date().getFullYear();
    return ( 
        <footer className="border-t">
         <div className="p-5 flex-center">
            {cuurrentYear} {APP_NAME}. All rights reserved.
         </div>
        </footer>
     );
}
 
export default Footer;