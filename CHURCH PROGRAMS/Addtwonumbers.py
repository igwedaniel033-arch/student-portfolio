import tkinter as tk
from tkinter import messagebox

# Create main window
root = tk.Tk()
root.title("Advanced Calculator")
root.geometry("400x500")
root.resizable(False, False)

# Input field
entry = tk.Entry(root, font=("Arial", 24), borderwidth=2, relief="solid")
entry.pack(fill="both", ipadx=8, pady=10, padx=10)

# Function to handle button click
def click(event):
    text = event.widget.cget("text")
    if text == "=":
        try:
            result = str(eval(entry.get()))
            entry.delete(0, tk.END)
            entry.insert(tk.END, result)
        except Exception:
            messagebox.showerror("Error", "Invalid Input")
            entry.delete(0, tk.END)
    elif text == "C":
        entry.delete(0, tk.END)
    else:
        entry.insert(tk.END, text)

# Buttons layout
buttons = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
    ["C"]
]

for r, row in enumerate(buttons):
    frame = tk.Frame(root)
    frame.pack(expand=True, fill="both")
    for c, char in enumerate(row):
        button = tk.Button(frame, text=char, font=("Arial", 20), relief="raised", borderwidth=1)
        button.pack(side="left", expand=True, fill="both")
        button.bind("<Button-1>", click)

# Run the app
root.mainloop()