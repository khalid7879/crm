# 🌿 SASS CRM iHelp - Overview

**SASS CRM iHelp** is a powerful, scalable, and secure multi-tenant CRM application designed to streamline customer relationship management. Built for modern businesses, it offers intuitive interfaces and flexible architecture, empowering teams to manage leads, clients, and sales with ease.

---

## Two Parts of the Application

In the iHelp platform, there are two main parts you will hear about:

- **Central Application**
- **Tenant Application**

### Central Application

This is the main part of iHelp that is shared by everyone. It includes:

- The sign-up page where new users (tenants) create their own iHelp account.
- The admin panel used by the iHelp team to manage all users and settings.

### Tenant Application

This is the personal version of iHelp that each organization gets after signing up. It includes:

- A separate database and storage for each tenant.
- All the tools and features the organization needs to use iHelp.
- Their own dashboard, settings, users, and data.

Each tenant is basically running **their own version of the iHelp app** inside the platform.

### Summary

- The **Central Application** is used to **create and manage tenant accounts**.
- The **Tenant Application** is the **actual app used by each organization**.

This setup helps iHelp stay organized, secure, and scalable.

---

## 🛠 Tech Stack & Security

- **Frontend:** React.js 19, Tailwind CSS 4 or SCSS
- **Backend:** PHP 8.2 (Laravel 12, InertiaJS)
- **Database:** MySQL 8
- **Security:** SSL, CSRF Token Enabled

---

## :pencil: Coding Convention

**Common Coding Case Principles for PHP and React**

> (1) camelCase : Used for variables, methods or
> functions, function params. See example below

```code
$firstName = "John";
function getUserInfo($firstName) {
}
```

> (2) PascalCase : Used for class names, interface names, traits, react component, namespace. See example below

```code
class UserProfile {
}
trait UserProfile {
}
interface UserProfile {
}
App\Http\Controllers\HomeController.php
Pages/Frontend/HomePage.jsx
```

> (3) snake_case : Used for model/table attributes, class and component state props which is related to model/table attributes. See example below

```protected $fillable = [
    'first_name',
    'last_name',
    'email_id',
];
```

> (4) UPPER_SNAKE_CASE: Used for constants and global configuration values. See example below

```code
define('PI', 3.1416);
const SITE_NAME = 'MyWebsite';
```

> (5) kebab-case: Used for slug/url, route. See example below

```code
Route::get('about-us', [AboutController::class, 'index']);
```

> (6) Comments on php and react code. See example below

    PHP:
        "
        Process 1: ## Your comments goes here for single line ##"
        "
        /*
        Process 2: Your comments goes here for multi line
        second line
        third line
        */
        "


    Javascript:
        "
        /*
        Process: Your comments goes here for multi line
        second line
        third line
        */
        "

---

## 👥 How to Contribute

Follow these steps to contribute to this project:

**1. Fork the Repository**  
Go to [https://github.com/mistersakil/ihelp-sass-crm-20250504](https://github.com/mistersakil/ihelp-sass-crm-20250504) and click the **Fork** button to create your own copy of the repository.

---

**2. Clone Your Fork**  
Open your terminal and run:

```bash
git clone https://github.com/[your-forked-repo-link]
```

> _Now go to your project root_

---

**3. Add the Original Repository as Upstream**
This lets you keep your fork up-to-date with the main project:

```bash
git remote add upstream https://github.com/mistersakil/ihelp-sass-crm-20250504.git
git remote -v
```

**4. Create a New Branch**
Create a branch for your feature or fix:

```code
git checkout -b your-branch-name
```

**5. Make Your Changes**
Now edit or add the necessary code, content, or documentation

**6. Stage and Commit Your Changes**
Use clear commit messages (e.g., feat:, fix:, docs:)

```code
git add .
git commit -m "feat: describe what you changed"
```

**7. Sync with the Upstream Repository**
Make sure your fork is in sync with the latest updates:

```code
git fetch upstream
git fetch upstream/master
optional: git rebase upstream/master

Resolve conflicts if necessary and continue:

git add .
git rebase --continue
```

**8. Push Your Branch to GitHub**

```code
git push origin your-branch-name
```

**9. Create a Pull Request**

- Go to your fork on GitHub.
- Click Compare & pull request.
- Write a clear title and description.
- Submit the PR to the '<strong>dev</strong>' branch of the original repository.

**10. Respond to Code Review**

If maintainers request changes:

- Make edits locally.
- Push them to the same branch:

```
git push origin your-branch-name
```

**11. Clean Up After Merge**
After your PR is merged, delete the feature branch:

```
git checkout master
git pull upstream master
git branch -d your-branch-name
git push origin --delete your-branch-name
```

**12. JSON response example**
After your PR is merged, delete the feature branch:

```
$result = $this->leadModelService->getLabelValueFormattedList(request('search'));
return response()->json([
    'success' => true,
    'status'  => 'success',
    'code'    => 200,
    'message' => '',
    'data'    => $result,
]);

```

## How to run project on development server

```commands
php artisan optimize:clear
composer dump
npm dev
php artisan server --port=8666
### For Production ###
npm run build
```

## Thank You 💞💞💞

> All are welcome to contribute to this project . thanks (1)
