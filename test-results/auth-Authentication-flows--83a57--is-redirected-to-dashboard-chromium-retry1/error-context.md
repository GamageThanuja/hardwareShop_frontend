# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication flows >> authenticated user visiting login is redirected to dashboard
- Location: tests/e2e/auth.spec.ts:79:2

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e5]:
      - img [ref=e6]
      - generic [ref=e8]:
        - heading "Hello again" [level=1] [ref=e9]
        - paragraph [ref=e10]: Login to continue
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Login
        - generic [ref=e15]: Welcome back. Enter your email and password, let's hope you remember them this time.
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]:
            - group [ref=e19]:
              - generic [ref=e20]: Username
              - textbox "Username" [ref=e21]:
                - /placeholder: your_username
            - group [ref=e22]:
              - generic [ref=e23]: Password
              - textbox "Password" [ref=e24]:
                - /placeholder: ••••••••
            - group [ref=e25]:
              - checkbox "Remember me for 30 days" [ref=e26]
              - checkbox
              - generic [ref=e28]: Remember me for 30 days
          - button "Sign in" [ref=e29]
        - button "Google Continue with Google" [ref=e30]:
          - img "Google"
          - text: Continue with Google
        - paragraph [ref=e31]:
          - text: Don't have an account?
          - link "Register" [ref=e32] [cursor=pointer]:
            - /url: register
  - region "Notifications alt+T"
  - alert [ref=e33]
```